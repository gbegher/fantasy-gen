export type JsonData = JsonObject | JsonArray | JsonPrimitive

type JsonObject = { [k: string]: JsonData }
type JsonPrimitive = string | boolean | number | null
type JsonArray = JsonData[]
