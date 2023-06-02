import { botConstructors } from "./bots"
import { staticRequestConstructorEntry } from "./static-request"
import { jsonRequestConstructorEntry } from "./json-request"

export const constructors = {
  ...botConstructors,
  ...staticRequestConstructorEntry,
  ...jsonRequestConstructorEntry,
}
