import deepEqual from "fast-deep-equal"

import { Constructor, Declaration } from "../util/context"
import { message, request } from "../util/requests"

const STATIC_REQUEST = "constructor:static-request"

type RequestData = {
  systemCore: string
  prompt: string
  result?: string
}

const requestResult = async ({ systemCore, prompt }: RequestData) =>
  request(message.system(systemCore), message.user(prompt))

const constructor: Constructor<any, RequestData> = {
  generateId: (name) => `static-request:${name}`,
  isUpdateRequired: (data, previousData) =>
    !previousData ||
    !deepEqual(
      [data.systemCore, data.prompt],
      [previousData.systemCore, previousData.prompt]
    ),
  create: async (_, { systemCore, prompt, result: givenResult }) => {
    const result = givenResult || (await requestResult({ systemCore, prompt }))

    return {
      constructorId: STATIC_REQUEST,
      serialize: () => ({
        systemCore,
        prompt,
        result,
      }),
      instance: result,
    }
  },
}

export const staticRequestConstructorEntry = {
  [STATIC_REQUEST]: constructor,
}

export const staticRequest = ({
  systemCore,
  prompt,
}: RequestData): Declaration<string, RequestData> => {
  return {
    data: { systemCore, prompt },
    constructor,
  }
}
