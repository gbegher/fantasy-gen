import endent from "endent"

import { Context } from "../util/context"
import { staticRequest } from "./static-request"
import { jsonRequest } from "./json-request"
import { JsonData } from "../util/json"
import { match, Sum } from "../util/pattern-matching"
import { product } from "../util/object-tools"

export type SchemaRequestProps<S extends Schema> = {
  name: string
  input_information: any
  schema: S
}

type SchemaReturnType<S extends Schema> = S extends {
  type: "OBJECT"
  value: infer Items extends Record<string, Schema>
}
  ? { [k in keyof Items]: SchemaReturnType<Items[k]> }
  : S extends { type: "LIST"; value: infer ItemSchema extends Schema }
  ? SchemaReturnType<ItemSchema>[]
  : S extends { type: "STRING" }
  ? string
  : never

type Description = {
  description: string
}

type Schema = Description &
  Sum<{
    OBJECT: Record<string, Schema>
    STRING: true
    LIST: Schema
  }>

type ShortSchemaDef = Schema | string

type SchemaFromShortDef<S extends ShortSchemaDef> = S extends Schema
  ? S
  : S extends string
  ? { type: "STRING"; description: S; value: true }
  : never

type DefineSchemaProps = Description & {
  items: Record<string, ShortSchemaDef>
}

type SchemaFromDefProps<Props extends DefineSchemaProps> = Props extends {
  items: infer Items extends Record<string, ShortSchemaDef>
}
  ? {
      type: "OBJECT"
      description: Props["description"]
      value: {
        [k in keyof Items]: SchemaFromShortDef<Items[k]>
      }
    }
  : never

type DefineListProps = {
  description: string
  schema: Schema | string
  listPrimer?: string
}

type SchemaFromListProps<Props extends DefineListProps> = {
  type: "LIST"
  description: Props["description"]
  value: SchemaFromShortDef<Props["schema"]>
}

const asSchema = (item: Schema | string): Schema => {
  if (typeof item === "string") {
    return {
      description: item,
      type: "STRING",
      value: true,
    }
  }

  return item
}

export const defineSchema = <Props extends DefineSchemaProps>({
  description,
  items,
}: Props): SchemaFromDefProps<Props> => {
  // @ts-ignore -- `map` not smart enough
  return {
    description,
    type: "OBJECT",
    value: product(items).map(asSchema),
  }
}

export const defineList = <Props extends DefineListProps>(
  definition: Props
): SchemaFromListProps<Props> => {
  return {
    description: definition.description,
    type: "LIST",
    // @ts-ignore
    value: asSchema(definition.schema),
  }
}

const systemCore = endent`
  You are a creative assistant for fantasy stories.
`

const deriveSchemaExplanation = (schema: Schema): string =>
  match(schema, {
    STRING: (_) => schema.description,
    OBJECT: (items) =>
      endent`
        ${schema.description}

        It consists of the following:
          ${deriveObjectSchemaExplanation(items)}
      `,
    LIST: (itemSchema) =>
      endent`
        ${schema.description}:
          ${deriveSchemaExplanation(itemSchema)}
      `,
  })

const deriveObjectSchemaExplanation = (items: Record<string, Schema>) =>
  product(items).reduce({
    init: () => "",
    step:
      ([key, value]) =>
      (acc) => {
        const renderedItem = endent`
          ${key}:
            ${deriveSchemaExplanation(value)}
        `
        return acc === "" ? renderedItem : [acc, renderedItem].join("\n")
      },
  })

const deriveJsonSchema = (schema: Schema): string =>
  match(schema, {
    STRING: () => '"..."',
    OBJECT: (items) => endent`
      {
        ${product(items).reduce({
          init: () => "",
          step:
            ([key, item]) =>
            (acc) => {
              const renderedItem = `"${key}": ${deriveJsonSchema(item)}`
              return acc === "" ? renderedItem : [acc, renderedItem].join(",\n")
            },
        })}
      }
    `,
    LIST: (itemSchema) => endent`
      [
        ${deriveJsonSchema(itemSchema)},
        ...
      ]
    `,
  })

const stringify = (json: JsonData) => JSON.stringify(json, undefined, 2)

export const twoStageSchemaRequest = async <S extends Schema>(
  context: Context,
  { name, input_information, schema }: SchemaRequestProps<S>
): Promise<SchemaReturnType<S>> => {
  const rawData = await context.declare(
    `${name}--raw-data`,
    staticRequest({
      systemCore,
      prompt: endent`
          We're following a formal process to write a fantasy story.

          Here is what we have so far:

          ${stringify(input_information)}

          And here is the information that we want to introduce now:

          ${deriveSchemaExplanation(schema)}

          Please generate this information.
          Don't include any introduction such as "Here's a possible anwer ...".
        `,
    })
  )

  return await context.declare(
    `schema-request:${name}--json-data`,
    jsonRequest({
      systemCore,
      prompt: endent`
          Here is a description of some data.

          ---
            ${rawData}
          ---

          Please extract from this a JSON string with the following schema:

          ${deriveJsonSchema(schema)}

          Make sure your answer contains only the extracted JSON string and nothing else.
        `,
    })
  )
}

export const schemaRequest = async <S extends Schema>(
  context: Context,
  { name, input_information, schema }: SchemaRequestProps<S>
): Promise<SchemaReturnType<S>> => {
  return await context.declare(
    name,
    jsonRequest({
      systemCore,
      prompt: endent`
          We're writing a fantasy novel.

          Here is what we have so far:

          ${stringify(input_information)}

          And here is the information that we want to introduce now:

          ${deriveSchemaExplanation(schema)}

          Please provide your response according to the following schema

          ${deriveJsonSchema(schema)}

          Make sure your answer contains only a JSON string and nothing else.
        `,
    })
  )
}
