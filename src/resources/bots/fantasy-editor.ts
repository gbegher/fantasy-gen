import { Constructor, Declaration } from "../../util/context"
import { JsonData } from "../../util/json"
import { message, request } from "../../util/requests"
import { Bot } from "./types"

const FANTASY_EDITOR_BOT = "constructor:fantasy-editor-bot"

type FantasyBotData = {}

const jsonRequest = async <K extends string>({
  systemCore,
  prompt,
}: {
  systemCore: string
  prompt: string
}): Promise<{ [k in K]: string }> => {
  const response = await request(
    message.system(systemCore),
    message.user(prompt)
  )

  return JSON.parse(response || "null")
}

const generateCentralIdea = (topic: string) =>
  jsonRequest({
    systemCore: `
      You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
    `,
    prompt: `
      I need an idea for a fantasy short story.
      Ca. 20k words. No plot. Just a very abstract idea or concept.

      ${topic}

      Please respond in JSON format: { "central_idea": "..." }
    `,
  })

const generateProtagonist = (central_idea: string) =>
  jsonRequest({
    systemCore: `
      You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
    `,
    prompt: `
      We're writing a fantasy short story, ca. 20k words.

      Here's the central idea:

      ${central_idea}

      What we need now is an interesting protagonist. Let's with their motivation. The result should not include plot details or anticipate character actions.

      We'll define:
      * their inner need
      * an obstacle: why they can't have it
      * transformation: how they transform in order to resolve their need

      Please respond in JSON format

      {
        "inner_need": "...",
        "obstacle": "...",
        "transformation": "..."
      }
    `,
  })

const generateMainLocation = (central_idea: string) =>
  jsonRequest({
    systemCore: `
      You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
    `,
    prompt: `
      We're writing a fantasy short story, ca. 20k words.

      Here's the central idea:

      ${central_idea}

      What we need now is the main location. We'll define:
      * a description
      * the relation to the central idea: how the central idea manifests

      Please respond in JSON format

      {
        "description": "...",
        "relation_to_central_idea": "..."
      }
    `,
  })

const generateMainFactions = (central_idea: string) =>
  jsonRequest({
    systemCore: `
    You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
  `,
    prompt: `
    We're writing a fantasy short story, ca. 20k words.

    Here's the central idea:

    ${central_idea}

    What we need now are three central factions in the society, each relating to the central idea in a differnt way:
    * main faction: they represent the dominant way to find a position to the central idea. they represent the status quo
    * affirmative subculture: a subgroup within the main faction. they adhere to the same idea but do so in a different way.
    * counter culture: they represent a take on the central idea that goes against the main groups approach

    Please respond in JSON format

    {
      "main_faction": {
        "name": "...",
        "description": "...",
        "approach_to_central_idea": "..."
      },
      "affirmative_subculture": {
        "name": "...",
        "description": "...",
        "unique_twist": "..."
      },
      "counter_culture": {
        "name": "...",
        "description": "...",
        "key_conflict": "..."
      }
    }
    `,
  })

const generateAntagonist = (context_information: JsonData) =>
  jsonRequest({
    systemCore: `
      You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
    `,
    prompt: `
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we'll introduce now is an antagonist. We'll start outlining their inner motivation. The antagonist should be part of or at least aligned with the main faction and the main factions approach to the central idea:

      We'll define:
      * their inner need: this should be purely internal and not directly referencing the setting or world.
      * an obstacle: why they can't have it. this should not be a group of people but rather an abstract issue within themselves
      * mechanism of control: this describes the way the antagonist has learned to deal with the obstacle and present their inner need to the outside world
      * resolution plan: how they plan to overcome the obstacle. this should not include references to the protagonist and also not include plot points as we'll define this at a later point

      Please respond in JSON format

      {
        "inner_need": "...",
        "obstacle": "...",
        "mechansim_of_control": "...",
        "resolution_plan": "..."
      }
    `,
  })

const generateProtagonistFactionRelations = (context_information: JsonData) =>
  jsonRequest({
    systemCore: `
      You are a creative assistant for writing fantasy novels and short stories. You always respond in JSON.
    `,
    prompt: `
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is a description of how the main character relates to the factions.
      * They should be opposed to the main faction but not incredibly strong.
      * They should have sympathies for both the affirmative subculture and the counter culture

      Please respond with in JSON format

      {
        "relations_to_factions": {
          "main_faction": {
            "relation_to_idea": "...",
            "relation_in_society": "...",
          },
          "affirmative_subculture": {
            "relation_to_idea": "...",
            "relation_in_society": "...",
          },
          "counter_culture": {
            "relation_to_idea": "...",
            "relation_in_society": "...",
          }
        }
      }
    `,
  })

const constructor: Constructor<Bot, FantasyBotData> = {
  generateId: (name) => `bot:fantasy-editor-${name}`,
  create: async (id, {}) => {
    return {
      constructorId: FANTASY_EDITOR_BOT,
      serialize: () => ({}),
      instance: {
        send: async () => {
          const { central_idea } = await generateCentralIdea(`
            It should take on a constructivist/postmodern perspective.
            Choose a topic other than gender.
            And it should be centered around characters and not an epic plot.
          `)

          const [protagonist, main_factions, main_location] = await Promise.all(
            [
              generateProtagonist(central_idea),
              generateMainFactions(central_idea),
              generateMainLocation(central_idea),
            ]
          )

          const protagonistFactionRelations =
            await generateProtagonistFactionRelations({
              central_idea,
              protagonist,
              main_factions,
            })

          const antagonist = await generateAntagonist({
            central_idea,
            main_factions,
          })

          console.log(
            JSON.stringify(
              {
                central_idea,
                protagonist,
                main_location,
                main_factions,
                protagonistFactionRelations,
                antagonist,
              },
              undefined,
              4
            )
          )

          return "todo"
        },
      },
    }
  },
}

export const fantasyBotConstructorEntry = {
  [FANTASY_EDITOR_BOT]: constructor,
}

export const fantasyEditorBot = (): Declaration<Bot, FantasyBotData> => {
  return {
    data: {},
    constructor,
  }
}
