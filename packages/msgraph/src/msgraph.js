import { addOperationParameter, createCadlLibrary, } from "@cadl-lang/compiler";
import { $query } from "@cadl-lang/rest";
const libDefinition = {
    name: "@msgraph-tools/msgraph",
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
};
export const msgraphLib = createCadlLibrary(libDefinition);
const { reportDiagnostic } = msgraphLib;
const idFieldsKey = Symbol();
export function $id(program, entity, idKey) {
    if (!idKey && entity.kind === "ModelProperty") {
        idKey = entity.name;
    }
    program.stateMap(idFieldsKey).set(entity, idKey);
}
const valueFieldsKey = Symbol();
export function $value(program, entity, valueKey) {
    if (!valueKey && entity.kind === "EnumMember") {
        valueKey = entity.name;
    }
    program.stateMap(valueFieldsKey).set(entity, valueKey);
}
const byRefFieldsKey = Symbol();
export function $byRef(program, entity, byRefKey) {
    if (!byRefKey && entity.kind === "ModelProperty") {
        byRefKey = entity.name;
    }
    program.stateMap(byRefFieldsKey).set(entity, byRefKey);
}
const serviceFieldsKey = Symbol();
export function $service(program, entity, serviceKey) {
    if (!serviceKey && entity.kind === "Model") {
        serviceKey = entity.name;
    }
    program.stateMap(serviceFieldsKey).set(entity, serviceKey);
}
const topFieldsKey = Symbol();
export function $top(program, entity, topKey) {
    if (!topKey && entity.kind === "Operation") {
        topKey = entity.name;
    }
    program.stateMap(topFieldsKey).set(entity, topKey);
}
const skipFieldsKey = Symbol();
export function $skip(program, entity, skipKey) {
    if (!skipKey && entity.kind === "Operation") {
        skipKey = entity.name;
    }
    let operation = entity;
    if (!operation) {
        console.log("@@@ Not operation. @@@");
        reportDiagnostic(program, {
            code: "skip-only-op",
            target: entity,
        });
    }
    else {
        console.log("@@@ IS operation. @@@");
        console.log(operation);
    }
    let qp = addOperationParameter(program, operation, "skip", "int32");
    qp.optional = true;
    $query(program, qp, "skip");
    program.stateMap(skipFieldsKey).set(entity, skipKey);
}
const skipTokenFieldsKey = Symbol();
export function $skipToken(program, entity, skipTokenKey) {
    if (!skipTokenKey && entity.kind === "Operation") {
        skipTokenKey = entity.name;
    }
    program.stateMap(skipTokenFieldsKey).set(entity, skipTokenKey);
}
//# sourceMappingURL=msgraph.js.map