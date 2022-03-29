import {
  ArrayType,
  checkIfServiceNamespace,
  DecoratorContext,
  EmitOptionsFor,
  EnumMemberType,
  EnumType,
  getAllTags,
  getDoc,
  getFormat,
  getFriendlyName,
  getIntrinsicModelName,
  getKnownValues,
  getMaxLength,
  getMaxValue,
  getMinLength,
  getMinValue,
  getPattern,
  getProperty,
  getPropertyType,
  getServiceHost,
  getServiceNamespace,
  getServiceNamespaceString,
  getServiceTitle,
  getServiceVersion,
  getSummary,
  getVisibility,
  isErrorModel,
  isErrorType,
  isIntrinsic,
  isNumericType,
  isSecret,
  isStringType,
  isVoidType,
  mapChildModels,
  ModelType,
  ModelTypeProperty,
  NamespaceType,
  OperationType,
  Program,
  resolvePath,
  Type,
  UnionType,
  UnionTypeVariant,
  validateDecoratorTarget,
} from "@cadl-lang/compiler";

import {
  getAllRoutes,
  getDiscriminator,
  http,
  HttpOperationParameter,
  HttpOperationParameters,
  OperationDetails,
} from "@cadl-lang/rest";


import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { findProjectRoot } from "@cadl-lang/compiler/core/util";
import { CsdlLibrary, reportDiagnostic } from "./lib.js";

const {
  getHeaderFieldName,
  getPathParamName,
  getQueryParamName,
  isBody,
  isHeader,
  isStatusCode,
  getStatusCodes,
  getStatusCodeDescription,
} = http;

export async function $onEmit(p: Program, emitterOptions?: EmitOptionsFor<CsdlLibrary>) {
  const options: CsdlEmitterOptions = {
    outputFile: resolvePath((p.compilerOptions.outputPath??"."), "./model.csdl"),
  };

  const emitter = createCsdlEmitter(p, options);
  await emitter.emitCsdl();
}

export interface CsdlEmitterOptions {
  outputFile: string;
}

function createCsdlEmitter(program: Program, options: CsdlEmitterOptions) {
  let root: any;
  let host: string | undefined;

  // Get the service namespace string for use in name shortening
  let serviceNamespace: string | undefined;
  let currentPath: any;
  let currentEndpoint: any;

  // Keep a list of all Types encountered that need definitions
  let schemas = new Set<Type>();

  let childModelMap: ReadonlyMap<ModelType, readonly ModelType[]>;

  return { emitCsdl };

  function initializeEmitter(serviceNamespaceType: NamespaceType, version?: string) {
    const template = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;
    
const root = new DOMParser().parseFromString(template, 'text/xml')
    host = getServiceHost(program);

    serviceNamespace = getServiceNamespaceString(program);
    currentPath = undefined;
    currentEndpoint = undefined;
    schemas = new Set();
    childModelMap = new Map();
  }

  async function emitCsdl() {
    const serviceNs = getServiceNamespace(program);
    if (!serviceNs) {
      return;
    }
    initializeEmitter(serviceNs);
    try {
      childModelMap = mapChildModels(program);
      //getAllRoutes(program).forEach(emitOperation);

      if (!program.compilerOptions.noEmit && !program.hasError()) {
        // Write out the Csdl document to the output path
        const outPath = resolvePath(options.outputFile);

        await program.host.writeFile(outPath, prettierOutput(new XMLSerializer().serializeToString(root)));
      }
    } catch (err) {
      if (err instanceof ErrorTypeFoundError) {
        // Return early, there must be a parse error if an ErrorType was
        // inserted into the Cadl output
        return;
      } else {
        throw err;
      }
    }
  }
}

function prettierOutput(output: string) {
  return output + "\n";
}

class ErrorTypeFoundError extends Error {
  constructor() {
    super("Error type found in evaluated Cadl output");
  }
}
