import { readFile, writeFile } from "./file-io"
import { JsonData } from "./json"

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type Context = {
  declare: <T, D extends JsonData>(
    name: string,
    declaration: Declaration<T, D>
  ) => Promise<T>
  save: () => void
}

export type ContextState = {
  resourceData: Record<string, ResourceData>
}

export type ResourceData = {
  constructorId: string
  data: JsonData
}

export type Declaration<T = any, D extends JsonData = JsonData> = {
  constructor: Constructor<T, D>
  data: D
}

export type Constructor<T = any, D extends JsonData = JsonData> = {
  generateId: (name: string) => string
  create: (id: string, data: D) => Promise<Resource<T, D>>
  isUpdateRequired?: (data: D, previousData: D) => boolean
}

export type Resource<T = any, D extends JsonData = JsonData> = {
  constructorId: string
  serialize: () => D
  instance: T
}

// ----------------------------------------------------------------------------
// Implementation
// ----------------------------------------------------------------------------

export const declareContext = async (
  contextName: string,
  constructors: Record<string, Constructor<any, any>>
): Promise<Context> => {
  const state = loadContextState(contextName)

  return createContextFromState(contextName, state, constructors)
}

const createContextFromState = async (
  contextName: string,
  state: ContextState,
  constructors: Record<string, Constructor>
): Promise<Context> => {
  const resources: Record<string, Resource> = {}
  const declaration_order: string[] = []

  const load = async () => {
    for (const id in state.resourceData) {
      resources[id] = await createResource(
        id,
        declarationFromData(constructors, state.resourceData[id])
      )
    }
  }

  const createResource = <T, D extends JsonData>(
    id: string,
    { constructor, data }: Declaration<T, D>
  ): Promise<Resource<T, D>> => {
    return constructor.create(id, data)
  }

  const serializeState = (): ContextState => {
    const resourceData: Record<string, ResourceData> = {}

    for (const id of declaration_order) {
      const { constructorId, serialize } = resources[id]

      resourceData[id] = {
        constructorId,
        data: serialize(),
      }
    }

    return {
      resourceData,
    }
  }

  await load()

  return {
    save: () => {
      saveContextState(contextName, serializeState())
    },
    declare: async (name, { constructor, data }) => {
      const id = constructor.generateId(name)
      declaration_order.push(id)

      if (id in resources) {
        const previousData = resources[id].serialize() as any

        if (
          constructor.isUpdateRequired &&
          constructor.isUpdateRequired(data, previousData)
        ) {
          console.log("updating", contextName, name)
          resources[id] = await createResource(id, { constructor, data })
        }
      } else {
        console.log("creating", contextName, name)
        resources[id] = await createResource(id, { constructor, data })
      }

      return resources[id].instance
    },
  }
}

const declarationFromData = (
  constructors: Record<string, Constructor>,
  { data, constructorId }: ResourceData
): Declaration => {
  return {
    data,
    constructor: constructors[constructorId],
  }
}

const STATE_FILE_PATH = ".state"

const loadContextState = (contextName: string): ContextState => {
  const stateFromFile = readFile<ContextState>(
    STATE_FILE_PATH,
    `${contextName}.json`
  )

  return {
    resourceData: stateFromFile?.resourceData || {},
  }
}

const saveContextState = (contextName: string, contextState: ContextState) => {
  writeFile(STATE_FILE_PATH, `${contextName}.json`, contextState)
}
