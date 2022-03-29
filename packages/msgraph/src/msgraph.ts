import {
  createCadlLibrary,
  OperationType,
  ModelTypeProperty,
  Program,
  DecoratorContext,
  setDecoratorNamespace,
  Type,
} from "@cadl-lang/compiler";

// import {
//   addOperationParameter,
// } from "@cadl-lang/compiler";

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
    "skip-op-fail": {
      severity: "error",
      messages: {
        default: "Failed to set up the skip parameter.",
      },
    },
  },
} as const;

export const msgraphLib = createCadlLibrary(libDefinition);
export type msgraphLibType = typeof msgraphLib;

export const { reportDiagnostic } = msgraphLib;

const idFieldsKey = Symbol();

export function $id({ program }: DecoratorContext, entity: Type, idKey: string) {
  if (!idKey && entity.kind === "ModelProperty") {
    idKey = entity.name;
  }
  program.stateMap(idFieldsKey).set(entity, idKey);
}

const valueFieldsKey = Symbol();

export function $value({ program }: DecoratorContext, entity: Type, valueKey: string) {
  if (!valueKey && entity.kind === "EnumMember") {
    valueKey = entity.name;
  }
  program.stateMap(valueFieldsKey).set(entity, valueKey);
}

const serviceFieldsKey = Symbol();

export function $service({ program }: DecoratorContext, entity: Type, serviceKey: string) {
  if (!serviceKey && entity.kind === "Model") {
    serviceKey = entity.name;
  }
  if(serviceKey )
  program.stateMap(serviceFieldsKey).set(entity, serviceKey);
}

const importModelFieldsKey = Symbol();

export function $importModel({ program }: DecoratorContext, entity: Type, importModelKey: string) {
  if (!importModelKey && entity.kind === "Model") {
    importModelKey = entity.name;
  }
  program.stateMap(importModelFieldsKey).set(entity, importModelKey);
}

const serverGeneratedFieldsKey = Symbol();

export function $serverGenerated({ program }: DecoratorContext, entity: Type, serverGeneratedKey: string) {
  if (!serverGeneratedKey && entity.kind === "ModelProperty") {
    serverGeneratedKey = entity.name;
  }
  program.stateMap(serverGeneratedFieldsKey).set(entity, serverGeneratedKey);
}

const externalFieldsKey = Symbol();

export function $external({ program }: DecoratorContext, entity: Type, externalKey: string) {
  if (!externalKey && entity.kind === "Model") {
    externalKey = entity.name;
  }
  program.stateMap(externalFieldsKey).set(entity, externalKey);
}

const partialFieldsKey = Symbol();

export function $partial({ program }: DecoratorContext, entity: Type, partialKey: string) {
  if (!partialKey && entity.kind === "Model") {
    partialKey = entity.name;
  }
  program.stateMap(partialFieldsKey).set(entity, partialKey);
}

const relationFieldsKey = Symbol();

export function $relation({ program }: DecoratorContext, entity: Type, relationKey: string) {
  if (!relationKey && entity.kind === "ModelProperty") {
    relationKey = entity.name;
  }
  program.stateMap(relationFieldsKey).set(entity, relationKey);
}


const refRelationFieldsKey = Symbol();

export function $refRelation({ program }: DecoratorContext, entity: Type, refRelationKey: string) {
  if (!refRelationKey && entity.kind === "ModelProperty") {
    refRelationKey = entity.name;
  }
  program.stateMap(refRelationFieldsKey).set(entity, refRelationKey);
}

const workloadNameFieldsKey = Symbol();

export function $workloadName({ program }: DecoratorContext, entity: Type, workloadNameKey: string) {
  if (!workloadNameKey && entity.kind === "ModelProperty") {
    workloadNameKey = entity.name;
  }
  program.stateMap(workloadNameFieldsKey).set(entity, workloadNameKey);
}

const requiredFieldsKey = Symbol();

export function $required({ program }: DecoratorContext, entity: Type, requiredKey: string) {
  if (!requiredKey && entity.kind === "ModelProperty") {
    requiredKey = entity.name;
  }
  program.stateMap(requiredFieldsKey).set(entity, requiredKey);
}

const immutableFieldsKey = Symbol();

export function $immutable({ program }: DecoratorContext, entity: Type, immutableKey: string) {
  if (!immutableKey && entity.kind === "ModelProperty") {
    immutableKey = entity.name;
  }
  program.stateMap(immutableFieldsKey).set(entity, immutableKey);
}

const writeOnlyFieldsKey = Symbol();

export function $writeOnly({ program }: DecoratorContext, entity: Type, writeOnlyKey: string) {
  if (!writeOnlyKey && entity.kind === "ModelProperty") {
    writeOnlyKey = entity.name;
  }
  program.stateMap(writeOnlyFieldsKey).set(entity, writeOnlyKey);
}


const topFieldsKey = Symbol();

export function $top({ program }: DecoratorContext, entity: Type, topKey: string) {
  if (!topKey && entity.kind === "Operation") {
    topKey = entity.name;
  }
  program.stateMap(topFieldsKey).set(entity, topKey);
}

const countFieldsKey = Symbol();

export function $count({ program }: DecoratorContext, entity: Type, countKey: string) {
  if (!countKey && entity.kind === "Operation") {
    countKey = entity.name;
  }
  program.stateMap(countFieldsKey).set(entity, countKey);
}

const expandFieldsKey = Symbol();

export function $expand({ program }: DecoratorContext, entity: Type, expandKey: string) {
  if (!expandKey && entity.kind === "Operation") {
    expandKey = entity.name;
  }
  program.stateMap(expandFieldsKey).set(entity, expandKey);
}

const orderByFieldsKey = Symbol();

export function $orderBy({ program }: DecoratorContext, entity: Type, orderByKey: string) {
  if (!orderByKey && entity.kind === "Operation") {
    orderByKey = entity.name;
  }
  program.stateMap(orderByFieldsKey).set(entity, orderByKey);
}


const skipFieldsKey = Symbol();

export function $skip(context: DecoratorContext, entity: Type, skipKey: string) {
  if (!skipKey && entity.kind === "Operation") {
    skipKey = entity.name;
  }
  let operation = entity as OperationType;
  if (!operation)
  {
    reportDiagnostic(context.program, {
        code: "skip-only-op",
        target: entity,
      });
  }
  else
  {
    // let qp = addOperationParameter(context.program, operation, "skip", "int32") as ModelTypeProperty;
    // if (!qp)
    // {
    //   reportDiagnostic(context.program, {
    //       code: "skip-op-fail",
    //       target: entity,
    //     });
    // }
    // else
    // {
    //   qp.optional = true;
    //   $query(
    //     context,
    //     qp,
    //     "skip",
    //   );

    //   context.program.stateMap(skipFieldsKey).set(entity, skipKey);
    // }
  }
}

const skipTokenFieldsKey = Symbol();

export function $skipToken({ program }: DecoratorContext, entity: Type, skipTokenKey: string) {
  if (!skipTokenKey && entity.kind === "Operation") {
    skipTokenKey = entity.name;
  }
  program.stateMap(skipTokenFieldsKey).set(entity, skipTokenKey);
}
