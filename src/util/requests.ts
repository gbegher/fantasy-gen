import { ChatCompletionRequestMessage } from "openai"

import { openai } from "../environment"
import { logger } from "./logging"

export type Message = {
  role: ChatCompletionRequestMessage["role"]
  content: ChatCompletionRequestMessage["content"]
}

const messageCreator =
  (role: "system" | "assistant" | "user") =>
  (content: string): Message => ({
    role,
    content,
  })

export const message = {
  system: messageCreator("system"),
  user: messageCreator("user"),
  assistant: messageCreator("assistant"),
}

const rawRequest = async (messages: Array<Message>) => {
  const axiosResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
    max_tokens: 1300,
  })

  return axiosResponse.data
}

export const request = async (...messages: Array<Message>) => {
  const response = await rawRequest(messages)

  logger.push({
    type: "REQUEST",
    input: { messages },
    response,
  })

  return response.choices[0].message?.content
}
