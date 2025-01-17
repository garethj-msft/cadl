import {
  DecoratorContext,
  getKeyName,
  isErrorType,
  isKey,
  ModelType,
  ModelTypeProperty,
  Program,
  setDecoratorNamespace,
  Type,
  validateDecoratorTarget,
} from "@cadl-lang/compiler";
import { reportDiagnostic } from "./diagnostics.js";
import { $path } from "./http.js";

export interface ResourceKey {
  resourceType: ModelType;
  keyProperty: ModelTypeProperty;
}

const resourceKeysKey = Symbol();

export function setResourceTypeKey(
  program: Program,
  resourceType: ModelType,
  keyProperty: ModelTypeProperty
): void {
  program.stateMap(resourceKeysKey).set(resourceType, {
    resourceType,
    keyProperty,
  });
}

export function getResourceTypeKey(program: Program, resourceType: ModelType): ResourceKey {
  // Look up the key first
  let resourceKey = program.stateMap(resourceKeysKey).get(resourceType);
  if (resourceKey) {
    return resourceKey;
  }

  // Try to find it in the resource type
  resourceType.properties.forEach((p: ModelTypeProperty) => {
    if (isKey(program, p)) {
      if (resourceKey) {
        reportDiagnostic(program, {
          code: "duplicate-key",
          format: {
            resourceName: resourceType.name,
          },
          target: p,
        });
      } else {
        resourceKey = {
          resourceType,
          keyProperty: p,
        };

        // Cache the key for future queries
        setResourceTypeKey(program, resourceType, resourceKey.keyProperty);
      }
    }
  });

  return resourceKey;
}

function cloneKeyProperties(context: DecoratorContext, target: ModelType, resourceType: ModelType) {
  const { program } = context;
  // Add parent keys first
  const parentType = getParentResource(program, resourceType);
  if (parentType) {
    cloneKeyProperties(context, target, parentType);
  }

  const resourceKey = getResourceTypeKey(program, resourceType);
  if (resourceKey) {
    const { keyProperty } = resourceKey;
    const keyName = getKeyName(program, keyProperty);

    const newProp = program.checker!.cloneType(keyProperty);
    newProp.name = keyName;
    newProp.decorators.push({
      decorator: $path,
      args: [],
    });
    $path(context, newProp, undefined as any);

    target.properties.set(keyName, newProp);
  }
}

export function $copyResourceKeyParameters(
  context: DecoratorContext,
  entity: Type,
  filter?: string
) {
  if (!validateDecoratorTarget(context.program, entity, "@copyResourceKeyParameters", "Model")) {
    return;
  }

  const reportNoKeyError = () =>
    reportDiagnostic(context.program, {
      code: "not-key-type",
      target: entity,
    });
  const templateArguments = entity.templateArguments;
  if (!templateArguments || templateArguments.length !== 1) {
    return reportNoKeyError();
  }

  if (templateArguments[0].kind !== "Model") {
    if (isErrorType(templateArguments[0])) {
      return;
    }
    return reportNoKeyError();
  }

  const resourceType = templateArguments[0] as ModelType;

  if (filter === "parent") {
    // Only copy keys of the parent type if there is one
    const parentType = getParentResource(context.program, resourceType);
    if (parentType) {
      cloneKeyProperties(context, entity, parentType);
    }
  } else {
    // Copy keys of the resource type and all parents
    cloneKeyProperties(context, entity, resourceType);
  }
}

const parentResourceTypesKey = Symbol();
export function getParentResource(
  program: Program,
  resourceType: ModelType
): ModelType | undefined {
  return program.stateMap(parentResourceTypesKey).get(resourceType);
}

export function $parentResource({ program }: DecoratorContext, entity: Type, parentType: Type) {
  if (!validateDecoratorTarget(program, parentType, "@parentResource", "Model")) {
    return;
  }

  program.stateMap(parentResourceTypesKey).set(entity, parentType);
}

setDecoratorNamespace("Cadl.Rest", $parentResource, $copyResourceKeyParameters);
