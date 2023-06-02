import deepEqual from "fast-deep-equal"
import endent from "endent"

import { Constructor, Declaration } from "../util/context"
import { JsonData } from "../util/json"
import { message, request } from "../util/requests"

const JSON_REQUEST = "constructor:json-request"

type RequestData = {
  systemCore: string
  prompt: string
  result?: string
}

const requestResult = async ({ systemCore, prompt }: RequestData) => {
  const rawResponse = await request(
    message.system(systemCore),
    message.user(prompt)
  )
  const response = rawResponse || "null"

  try {
    return JSON.parse(response)
  } catch {
    console.log("Failed to parse json response:", response)
    const salvagedResponse = await request(
      message.system(endent`
        You are function that extracts JSON data.
        Your response should only return valid JSON strings.
      `),
      message.user(`
        Here's a text that contains a JSON string but can not be processed by 'JSON.parse'.
        ---
          ${response}
        ---
        Please extract the JSON string.
        Make sure your answer contains nothing but the raw JSON string itself.
      `)
    )

    return JSON.parse(salvagedResponse || "null")
  }
}

const constructor: Constructor<any, RequestData> = {
  generateId: (name) => `json-request:${name}`,
  isUpdateRequired: (data, previousData) =>
    !previousData ||
    !deepEqual(
      [data.systemCore, data.prompt],
      [previousData.systemCore, previousData.prompt]
    ),
  create: async (_, { systemCore, prompt, result: givenResult }) => {
    const result = givenResult || (await requestResult({ systemCore, prompt }))

    return {
      constructorId: JSON_REQUEST,
      serialize: () => ({
        systemCore,
        prompt,
        result,
      }),
      instance: result,
    }
  },
}

export const jsonRequestConstructorEntry = {
  [JSON_REQUEST]: constructor,
}

export const jsonRequest = <T extends JsonData = Record<string, JsonData>>({
  systemCore,
  prompt,
}: RequestData): Declaration<T, RequestData> => {
  return {
    data: { systemCore, prompt },
    constructor,
  }
}
