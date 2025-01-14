import { compile, getSourceLocation } from "@cadl-lang/compiler";
import debounce from "debounce";
import lzutf8 from "lzutf8";
import * as monaco from "monaco-editor";
import { BrowserHost } from "./browserHost";
import { samples } from "./samples";
import "./style.css";

export function createUI(host: BrowserHost) {
  const tabContainer = document.getElementById("outputTabs")!;
  const mainModel = monaco.editor.createModel(
    "",
    "cadl",
    monaco.Uri.parse("inmemory://test/main.cadl")
  );

  mainModel.onDidChangeContent(
    debounce(() => {
      doCompile();
    }, 200)
  );

  const editor = monaco.editor.create(document.getElementById("editor")!, {
    model: mainModel,
    language: "cadl",
    "semanticHighlighting.enabled": true,
    automaticLayout: true,
    tabSize: 2,
    minimap: {
      enabled: false,
    },
  });

  const output = monaco.editor.create(document.getElementById("output")!, {
    readOnly: true,
    language: "json",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  });

  window.addEventListener("resize", () => {
    editor.layout();
  });

  if (window.location.search.length > 0) {
    const parsed = new URLSearchParams(window.location.search);
    const compressed = parsed.get("c");
    if (compressed) {
      const content = lzutf8.decompress(compressed, { inputEncoding: "Base64" });
      mainModel.setValue(content);
    }
  }

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    saveCode();
  });

  document.getElementById("share")?.addEventListener("click", saveCode);
  document.getElementById("newIssue")?.addEventListener("click", newIssue);
  initSamples();
  doCompile();

  return;

  function saveCode() {
    const contents = mainModel.getValue();
    const compressed = lzutf8.compress(contents, { outputEncoding: "Base64" });
    history.pushState(null, "", window.location.pathname + "?c=" + encodeURIComponent(compressed));
    navigator.clipboard.writeText(window.location.toString());
  }

  function initSamples() {
    const sampleSelect = document.getElementById("samples")! as HTMLSelectElement;

    for (const sample of Object.keys(samples)) {
      const option = document.createElement("option");
      option.innerText = sample;
      sampleSelect.appendChild(option);
    }

    sampleSelect.addEventListener("change", () => {
      const value = sampleSelect.value;
      const code = samples[value];
      mainModel.setValue(code);
    });
  }

  async function emptyOutputDir() {
    // empty output directory
    const dirs = await host.readDir("./cadl-output");
    for (const file of dirs) {
      const path = "./cadl-output/" + file;
      const uri = monaco.Uri.parse(host.pathToFileURL(path));
      const model = monaco.editor.getModel(uri);
      if (model) {
        model.dispose();
      }
      await host.unlink(path);
    }
  }
  async function doCompile() {
    host.writeFile("main.cadl", mainModel.getValue());
    await emptyOutputDir();
    const program = await compile("main.cadl", host, {
      outputPath: "cadl-output",
      swaggerOutputFile: "cadl-output/openapi.json",
      emitters: ["@cadl-lang/openapi3"],
    });
    const markers: monaco.editor.IMarkerData[] = [];
    for (const diag of program.diagnostics) {
      const loc = getSourceLocation(diag.target);
      if (!loc) continue;
      const start = loc.file.getLineAndCharacterOfPosition(loc.pos);
      const end = loc.file.getLineAndCharacterOfPosition(loc.end);

      markers.push({
        startLineNumber: start.line + 1,
        startColumn: start.character + 1,
        endLineNumber: end.line + 1,
        endColumn: end.character + 1,
        message: diag.message,
        severity: monaco.MarkerSeverity.Error,
      });
    }

    monaco.editor.setModelMarkers(mainModel, "owner", markers);

    tabContainer.innerHTML = "";

    const dirs = await host.readDir("./cadl-output");

    let first = true;
    for (const file of dirs) {
      const link = document.createElement("a");
      link.addEventListener("click", async () => {
        await loadOutputFile(link, "./cadl-output/" + file);
      });
      link.innerText = file;
      tabContainer.appendChild(link);
      if (first) {
        loadOutputFile(link, "./cadl-output/" + file);
        first = false;
      }
    }
  }

  async function loadOutputFile(link: HTMLAnchorElement, path: string) {
    for (const link of tabContainer.querySelectorAll("a") as any) {
      (link as HTMLLinkElement).classList.remove("active");
    }
    link.classList.add("active");
    const contents = await host.readFile(path);
    const uri = monaco.Uri.parse(host.pathToFileURL(path));
    const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel("", "json", uri);
    model.setValue(contents.text);
    output.setModel(model);
  }

  function newIssue() {
    saveCode();
    const bodyPayload = encodeURIComponent(`\n\n\n[Playground Link](${document.location.href})`);
    const url = `https://github.com/microsoft/cadl/issues/new?body=${bodyPayload}`;
    window.open(url, "_blank");
  }
}
