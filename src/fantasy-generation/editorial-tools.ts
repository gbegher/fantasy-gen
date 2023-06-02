import endent from "endent"

import { Context } from "../util/context"
import {
  defineList,
  defineSchema,
  schemaRequest,
} from "../resources/schema-request"
import { JsonData } from "../util/json"

export type ImproveParagraphProps = {
  name: string
  paragraph: string
  paragraph_instructions: string
  background_information: JsonData
}

export const improveParagraph = async (
  context: Context,
  {
    name,
    paragraph,
    paragraph_instructions,
    background_information,
  }: ImproveParagraphProps
) => {
  const text_fragments = await schemaRequest(context, {
    name: `${name}-improve-fragments`,
    input_information: {
      paragraph,
      paragraph_instructions,
      background_information,
    },
    schema: defineList({
      description:
        "A full breakdown of the paragraph into fragments of sentences.",
      schema: defineSchema({
        description:
          "A fragment is a part of the given paragraph that represents a coherent fragment within the text.",
        items: {
          text: "The respective part of the text, repeated verbatim",
          explantation:
            "An explanation of how the fragment fulfills the paragraph instructions and which instructions it fulfills.",
        },
      }),
    }),
  })

  const writing_instructions = await schemaRequest(context, {
    name: `${name}-writing-instructions`,
    input_information: {
      text_fragments,
      paragraph_instructions,
      background_information,
    },
    schema: defineList({
      description: endent`
        The text fragments are a full decomposition of a paragraph that was written according to the paragraph instructions.
        We want to transform this list into by dropping the 'text' field and by rephrasing the explanation into writing instructions.
      `,
      schema: defineSchema({
        description: "",
        items: {
          writing_instructions:
            "A rephrasing of the respective explanation into a writing instruction.",
        },
      }),
    }),
  })

  const improved_writing_instructions = await schemaRequest(context, {
    name: `${name}-improved-writing-instructions`,
    input_information: {
      writing_instructions,
      paragraph_instructions,
      background_information,
    },
    schema: defineList({
      description: endent`
        The writing instructions are a list of instructions on how to turn the paragraph instructions into a paragraph.
        We want to improve these instructions. We'll do so by extending the writing instructions of each item as described below.
      `,
      schema: defineSchema({
        description: "",
        items: {
          writing_instructions: endent`
            Make the previous writing instructions more detailed.
            Do so by adding observations, smart ideas of how to achieve the goal of the instruction, clever usage of observations, etc.
            Be creative.
          `,
        },
      }),
    }),
  })

  const { paragraph: improved_paragraph } = await schemaRequest(context, {
    name: `${name}-improved-paragraph`,
    input_information: {
      writing_instructions: improved_writing_instructions,
      paragraph_instructions,
      background_information,
    },
    schema: defineSchema({
      description: endent`
        The writing instructions are a list of instructions on how to turn the paragraph instructions into a paragraph.
        Each writing instruction is intended to correspond to a text fragment; Most likely a part of a sentence.
        We now want to turn these instructions into a paragraph. We'll to so by creating a text fragement for each instruction.
        Then we combine the fragments into a full text.
      `,
      items: {
        fragments: defineList({
          description: "",
          schema: defineSchema({
            description: "",
            items: {
              writing_instructions:
                "Repeat the writing instructions of the respectiive item verbatim",
              text: "A text that fulfills the writing instructions",
              explanation:
                "An explanation on how the text fulfills the writing instructions",
            },
          }),
        }),
        paragraph: endent`
          All the fragments combined into a single paragraph.
        `,
      },
    }),
  })

  return improved_paragraph
}

export const removeStylisticClichees = async (
  context: Context,
  {
    name,
    paragraph,
    paragraph_instructions,
    background_information,
  }: ImproveParagraphProps
) => {
  const list_of_cliches = await schemaRequest(context, {
    name: `${name}-list-of-cliches`,
    input_information: {
      paragraph,
    },
    schema: defineList({
      description: endent`
            We're given a paragraph.
            We need a list of all phrases in the paragraph that could be considered stylistic cliches.
          `,
      schema: defineSchema({
        description: "",
        items: {
          text: "State the part of the text that is a cliche",
          explanation:
            "An explanation of why the respective part of the text could be considered a stylistic cliche",
        },
      }),
    }),
  })

  const { updated_paragraph } = await schemaRequest(context, {
    name: `${name}-list-of-cliches`,
    input_information: {
      paragraph,
      list_of_cliches,
      paragraph_instructions,
      background_information,
    },
    schema: defineSchema({
      description: `
        We're given a paragraph and a list of stylistic cliches that occur in the paragraph.
        Please provide an updated version of the paragraph that avoids these cliches.
      `,
      items: {
        updated_paragraph: endent`
          The upated paragraph.

          Please make sure that the paragraph does still follow the writing instructions.
          Also ensure that no contradiction to the background information is added.
        `,
      },
    }),
  })

  return updated_paragraph
}
