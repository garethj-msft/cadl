import { createCadlLibrary, paramMessage } from "@cadl-lang/compiler";

export const libDef = {
  name: "@cadl-lang/csdl",
  diagnostics: {
    "path-query": {
      severity: "error",
      messages: {
        default: `CSDL does not allow paths containing a query string.`,
      },
    },
    "invalid-schema": {
      severity: "error",
      messages: {
        default: paramMessage`Couldn't get schema for type ${"type"}`,
      },
    },
    "union-null": {
      severity: "error",
      messages: {
        default: "Cannot have a union containing only null types.",
      },
    },
  },
  emitter: {
    names: ["csdl"],
  },
} as const;
const lib = createCadlLibrary(libDef);
export const { reportDiagnostic } = lib;

export type CsdlLibrary = typeof lib;
