import {
  Program,
  Type,
  OperationType,
  addOperationParameter,
  SyntaxKind,
  createCadlLibrary,
  paramMessage,
  NewParameterOptions,
  ModelTypeProperty,
} from "@cadl-lang/compiler";
import { http } from "@cadl-lang/rest";
const { $query } = http;

const libDefinition = {
  name: "@cadl-lang/msgraph",
  diagnostics: {
    "entityContainer-only-namespace": {
      severity: "error",
      messages: {
        default: "The @entityContainer decorator can only be applied to namespaces.",
      },
    },
    "skip-only-op": {
      severity: "error",
      messages: {
        default: "The @skip decorator can only be applied to operations.",
      },
    },
  },
} as const;

export const msgraphLib = createCadlLibrary(libDefinition);

const { reportDiagnostic } = msgraphLib;

const idFieldsKey = Symbol();

export function $id(program: Program, entity: Type, idKey: string) {
  if (!idKey && entity.kind === "ModelProperty") {
    idKey = entity.name;
  }
  program.stateMap(idFieldsKey).set(entity, idKey);
}

const valueFieldsKey = Symbol();

export function $value(program: Program, entity: Type, valueKey: string) {
  if (!valueKey && entity.kind === "EnumMember") {
    valueKey = entity.name;
  }
  program.stateMap(valueFieldsKey).set(entity, valueKey);
}

const byRefFieldsKey = Symbol();

export function $byRef(program: Program, entity: Type, byRefKey: string) {
  if (!byRefKey && entity.kind === "ModelProperty") {
    byRefKey = entity.name;
  }
  program.stateMap(byRefFieldsKey).set(entity, byRefKey);
}

const serviceFieldsKey = Symbol();

export function $service(program: Program, entity: Type, serviceKey: string) {
  if (!serviceKey && entity.kind === "Model") {
    serviceKey = entity.name;
  }
  program.stateMap(serviceFieldsKey).set(entity, serviceKey);
}


const topFieldsKey = Symbol();

export function $top(program: Program, entity: Type, topKey: string) {
  if (!topKey && entity.kind === "Operation") {
    topKey = entity.name;
  }
  program.stateMap(topFieldsKey).set(entity, topKey);
}

const skipFieldsKey = Symbol();

export function $skip(program: Program, entity: Type, skipKey: string) {
  if (!skipKey && entity.kind === "Operation") {
    skipKey = entity.name;
  }
  let operation = entity as OperationType;
  if (!operation)
  {
    console.log("@@@ Not operation. @@@");
    reportDiagnostic(program, {
        code: "skip-only-op",
        target: entity,
      });
  }
  else
  {
    console.log("@@@ IS operation. @@@");
    console.log(operation);
  }

  let qp = addOperationParameter(program, operation, "skip", "int32") as ModelTypeProperty;
  qp.optional = true;
  $query(
    program,
    qp,
    "skip",
  );

  program.stateMap(skipFieldsKey).set(entity, skipKey);
}

const skipTokenFieldsKey = Symbol();

export function $skipToken(program: Program, entity: Type, skipTokenKey: string) {
  if (!skipTokenKey && entity.kind === "Operation") {
    skipTokenKey = entity.name;
  }
  program.stateMap(skipTokenFieldsKey).set(entity, skipTokenKey);
}

