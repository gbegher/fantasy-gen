import { Constructor, Declaration } from "../../util/context"
import { message, Message, request } from "../../util/requests"
import { Bot } from "./types"

const HISTORY_BOT = "constructor:history-bot"

type HistoryBotData = {
  systemCore: string
  history: Message[]
}

const historyBotConstructor: Constructor<Bot, HistoryBotData> = {
  generateId: (name) => `bot:history-${name}`,
  create: async (id, { systemCore, history: initialHistory }) => {
    let history = initialHistory

    return {
      constructorId: HISTORY_BOT,
      serialize: () => ({ systemCore, history }),
      instance: {
        send: async (prompt) => {
          const response = await request(
            message.system(systemCore),
            ...history,
            message.user(prompt)
          )

          if (!response) {
            throw new Error(`no response from bot '${id}'`)
          }

          history = [
            ...history,
            message.user(prompt),
            message.assistant(response),
          ]

          return response
        },
      },
    }
  },
}

export const historyBotConstructorEntry = {
  [HISTORY_BOT]: historyBotConstructor,
}

export const historyBot = (
  systemCore: string
): Declaration<Bot, HistoryBotData> => {
  return {
    data: { systemCore, history: [] },
    constructor: historyBotConstructor,
  }
}
