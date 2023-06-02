import { fantasyBotConstructorEntry } from "./fantasy-editor"
import { historyBotConstructorEntry } from "./history-bot"

export * from "./history-bot"

export const botConstructors = {
  ...historyBotConstructorEntry,
  ...fantasyBotConstructorEntry,
}
