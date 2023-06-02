import endent from "endent"

import { Context } from "../util/context"
import {
  defineList,
  defineSchema,
  schemaRequest,
} from "../resources/schema-request"
import { JsonData } from "../util/json"

export type CharacterArcSetupProps = {
  identifier: string
  character_concept: string
  background_information: JsonData
}

export const characterArcSetup = async (
  context: Context,
  {
    identifier,
    character_concept,
    background_information,
  }: CharacterArcSetupProps
) => {
  const character_arc_setup = await schemaRequest(context, {
    name: `${identifier}-character-arc-setup`,
    input_information: {
      character_concept,
      background_information,
    },
    schema: defineSchema({
      description: endent`
        An initial setup for a character according to the .
        The given character concept should serve as a basis and be expanded upon.
        Everything should be kept in abstract terms as we only want to expand this setup into plot points at a later point in time.
        Accordingly, this setup should not introduce additional characters, locations, etc.

        Please also consider the background information to make the character grounded in our world and setting.
      `,
      items: {
        role: endent`
          A description of the role this character plays in the story.
          This description should also explain how this character fulfils the stated character concept.
        `,
        narrative_purpose:
          "A description of the narrative purpose of this character.",
        traits: defineList({
          description:
            "A list of character traits and how they change throughout the story.",
          schema: defineSchema({
            description: "",
            items: {
              trait: "The character trait.",
              starting_state:
                "A description of how this trait is when the reader first encounters the character.",
              final_state: endent`
                A description of the state of this trait at the end of the characters arc.
                This should only describe the final state and not how we get there.
              `,
              narrative_purpose:
                "A description of the narrative purpose this trait serves.",
              relation_to_background_information: endent`
                A detailed description of the trait relates to the background information.
                Be specific and shortly restate the relevant parts of the background information.
              `,
            },
          }),
        }),
        inner_needs: defineList({
          description: "A list of inner needs of the character.",
          schema: defineSchema({
            description: "",
            items: {
              inner_need: "A description of the inner need",
              inner_obstacle:
                "An inner obstacle that prevents them from fulfilling the need",
              narrative_purpose:
                "A description of the narrative purpose this need serves.",
              relation_to_theme: endent`
                A detailed description of the need relates to the general theme of the story.
              `,
            },
          }),
        }),
      },
    }),
  })

  return {
    character_arc_setup,
  }
}
