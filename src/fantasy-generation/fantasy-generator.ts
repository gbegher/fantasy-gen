import endent from "endent"

import { constructors } from "../resources"
import { jsonRequest } from "../resources/json-request"
import { declareContext } from "../util/context"
import { JsonData } from "../util/json"

// ----------------------------------------------------------------------------
// steps
// ----------------------------------------------------------------------------

const systemCore = endent`
  You are a creative assistant for writing fantasy novels and short stories.
  You always respond in JSON.
`

const generateCentralIdea = (topic: string) =>
  jsonRequest<{ central_idea: string }>({
    systemCore,
    prompt: endent`
      I need an idea for a fantasy short story. Ca. 20k words.
      The idea should not describe the plot.
      Just a very abstract idea or concept.

      ${topic}

      Please respond fully in JSON format

      {
        "central_idea": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateProtagonist = (central_idea: string) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's the central idea:

      ${central_idea}

      What we need now is an interesting protagonist.
      Let's begin with their motivation.
      The result should not include plot details or anticipate character actions.

      We'll define:
      * their inner need
      * an obstacle: why they can't have it
      * transformation: how they transform in order to resolve their need

      Please respond fully in JSON format

      {
        "inner_need": "...",
        "obstacle": "...",
        "transformation": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateMainLocation = (central_idea: string) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's the central idea:

      ${central_idea}

      What we need now is the main location. We'll define:
      * a description
      * the relation to the central idea: how the central idea manifests

      Please respond fully in JSON format

      {
        "description": "...",
        "relation_to_central_idea": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateMainFactions = (central_idea: string) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's the central idea:

      ${central_idea}

      What we need now are three central factions in the society, each relating to the central idea in a differnt way:
      * main faction: they represent the dominant way to find a position to the central idea. they represent the status quo
      * affirmative subculture: a subgroup within the main faction. they adhere to the same idea but do so in a different way.
      * counter culture: they represent a take on the central idea that goes against the main groups approach

      Please respond fully in JSON format

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

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

// Faction Location relations

const generateMainFactionLocationRelation = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have so far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is to relate the main faction to the main location.
      Keep in mind that the main faction represents the dominant position regarding the central idea.

      Please respond fully in JSON format

      {
        "relation_to_main_location": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateSubcultureLocationRelation = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have so far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is to relate the affirmative subculture to the main location.
      Keep in mind that the affirmative subculture is a part of the main faction.
      On the other hand, their take on the central idea is a different one and this should be reflected.

      Please respond fully in JSON format

      {
        "relation_to_main_location": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateCounterCultureLocationRelation = (
  context_information: JsonData
) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have so far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is to relate the counter culture with the main location.

      Please respond fully in JSON format

      {
        "relation_to_main_location": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateSummaryOfMainLocationIncludingRelations = (
  context_information: JsonData
) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have so far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is to create a summary description of the main location based on this information.
      Don't mention the specific factions in this summary.

      Please respond fully in JSON format

      {
        "summary_main_location": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateMainFactionPlaces = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have so far:

      ${JSON.stringify(context_information, undefined, 3)}

      The hierarchy

      What we need now is to create two places within the main location that are relevant to the main faction.
      For each place, the relevance_for_the_faction should reflect the main factions relation_to_main_location in a different way.

      Please respond in directly in JSON format

      {
        "place_1": {
          "name": "...",
          "dominant_faction": "main_faction",
          "relevance_for_the_faction": "...",
          "description": "..."
        },
        "place_2": {
          "name": "...",
          "dominant_faction": "main_faction",
          "relevance_for_the_faction": "...",
          "description": "..."
        }
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

// Protagonist

const generateProtagonistFactionRelations = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is a description of how the main character relates to the factions.
      * They should be opposed to the main faction but not incredibly strong.
      * They should have sympathies for both the affirmative subculture and the counter culture

      Please respond fully in JSON format

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

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateAntagonist = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we'll introduce now is an antagonist.
      We'll start outlining their inner motivation.
      The antagonist should be part of or at least aligned with the main faction and the main factions approach to the central idea:

      We'll define:
      * their inner need: this should be purely internal and not directly referencing the setting or world.
      * an obstacle: why they can't have it. this should not be a group of people but rather an abstract issue within themselves
      * mechanism of control: this describes the way the antagonist has learned to deal with the obstacle and present their inner need to the outside world
      * resolution plan: how they plan to overcome the obstacle. this should not include references to the protagonist and also not include plot points as we'll define this at a later point

      Please respond fully in JSON format

      {
        "inner_need": "...",
        "obstacle": "...",
        "mechansim_of_control": "...",
        "resolution_plan": "..."
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateAntagonistFactionRelations = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is a description of how the antagnoist relates to the factions.
      * They should aligned with the main factions approach
      * They should be opposed to the counter culture
      * Their relation to the affirmative subculture should be nuanced

      Please respond fully in JSON format

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

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateConceptForSharedGoal = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
      We're writing a fantasy short story, ca. 20k words.

      Here's what we have to far:

      ${JSON.stringify(context_information, undefined, 3)}

      What we need now is a shared goal for the protagonist and the antagonist.
      The first step is to find an abstract contept for the goal that we will refine later on.
      Besides the concept itself we'll also exemplify how both the protagonist and the antagonist relate to the concept.
      For the protagonist the relation should be rooted in their obstacle.
      For the antagonist the relation should be rootet in their mechanism of control.

      Please respond fully in JSON format

      {
        "concept_for_shared_goal": {
          "concept": "...",
          "how_the_protagonist_relates": "...",
          "how_the_antagonist_relates": "...",
        }
      }

      Make sure your answer can be processed by JSON.parse(...).
    `,
  })

const generateMythicalSecret = (context_information: JsonData) =>
  jsonRequest({
    systemCore,
    prompt: endent`
        We're writing a fantasy short story, ca. 20k words.

        Here's what we have to far:

        ${JSON.stringify(context_information, undefined, 3)}

        What we need now is a mythical element that the reader discovers.
        It should build on the central idea and be connected with the main location.
        It should be some form of hidden layer or interpretation of the central idea.
        Let's start with only a rough concept.
        But please don't include references to the protagonists actions.

        Please respond fully in JSON format

        {
          "mythical_secret": {
            "concept": "...",
            "relation_to_central_idea": "..."
          }
        }

        Make sure your answer can be processed by JSON.parse(...).
      `,
  })

const generatePhilosophicalProfile = (
  tag: string,
  target: string,
  context_information: JsonData
) =>
  jsonRequest({
    systemCore,
    prompt: endent`
    We're writing a fantasy short story, ca. 20k words.

    Here's what we have to far:

    ${JSON.stringify(context_information, undefined, 3)}

    What we need now is to create a breakdown of the philosophy of ${target}.

    It should describe
    * Epistemology: The beliefs about knowledge and how it is obtained.
    * Ethics: The beliefs about what is morally right and wrong, and how these beliefs influence their behavior.
    * Metaphysics: The beliefs about the nature of reality and existence.
    * Politics: The beliefs about how society should be organized and governed and how this is legitimized.
    * Aesthetics: The beliefs about what is beautiful or aesthetically pleasing, and how these beliefs influence their behavior.

    Please respond only in JSON. The response should start with { and end with }. The format is:

    {
      "${tag}_philosophy_profile": {
        "epistemology": "...",
        "ethics": "...",
        "metaphysics": "...",
        "politics": "...",
        "aesthetics": "..."
      }
    }
  `,
  })

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

export const createStory = async (name: string, topic: string) => {
  const context = await declareContext(name, { ...constructors })

  // ---------------------------------------------------------------------
  // Idea, Setting, Worldbuilding

  const { central_idea } = await context.declare(
    "central-idea",
    generateCentralIdea(topic)
  )

  const [protagonist, main_factions, main_location] = await Promise.all([
    context.declare("protagonist", generateProtagonist(central_idea)),
    context.declare("main-factions", generateMainFactions(central_idea)),
    context.declare("main-location", generateMainLocation(central_idea)),
  ])

  const protagonist_faction_relations = await context.declare(
    "protagonist-faction-relations",
    generateProtagonistFactionRelations({
      central_idea,
      protagonist,
      main_factions,
    })
  )

  // Antagonist

  const antagonist = await context.declare(
    "antagonist",
    generateAntagonist({
      central_idea,
      main_factions,
    })
  )

  const antagonist_faction_relations = await context.declare(
    "antagonist-faction-relations",
    generateAntagonistFactionRelations({
      central_idea,
      main_factions,
      antagonist,
    })
  )

  const conceptForSharedGoal = await context.declare(
    "concept-for-shared-goal",
    generateConceptForSharedGoal({
      central_idea,
      main_factions,
      protagonist,
      protagonist_faction_relations,
      antagonist,
      antagonist_faction_relations,
    })
  )

  const main_faction_location_relation = await context.declare(
    "main_faction_location_relation",
    generateMainFactionLocationRelation({
      central_idea,
      main_location,
      main_faction: main_factions.main_faction,
      faction_to_relate: "main_faction",
    })
  )

  const affirmative_subculture_location_relation = await context.declare(
    "subculture_faction_location_relation",
    generateSubcultureLocationRelation({
      central_idea,
      main_location,
      main_faction: main_factions.main_faction,
      main_faction_location_relation,
      affirmative_subculture: main_factions.affirmative_subculture,
    })
  )

  const counter_culture_location_relation = await context.declare(
    "counter_culture_location_relation",
    generateCounterCultureLocationRelation({
      central_idea,
      main_location,
      counter_culture: main_factions.counter_culture,
    })
  )

  const summary_main_location = await context.declare(
    "summary_main_location",
    generateSummaryOfMainLocationIncludingRelations({
      central_idea,
      main_location,
      main_factions,
      relations_of_factions_and_main_location: {
        main_faction: main_faction_location_relation,
        affirmative_subculture: affirmative_subculture_location_relation,
        counter_culture: counter_culture_location_relation,
      },
    })
  )

  const main_faction_places = await context.declare(
    "main_faction_places",
    generateMainFactionPlaces({
      central_idea,
      main_location,
      summary_main_location,
      main_faction: main_factions.main_faction,
      relation_to_main_location: main_faction_location_relation,
    })
  )

  // ---------------------------------------------------------------------
  // Momentum: The meta-plot that puts things in motion

  // -------------------------
  // The mythical secret

  const mythical_secret = await context.declare(
    "mythical_secret",
    generateMythicalSecret({
      central_idea,
      main_location,
      summary_main_location,
    })
  )

  const philosophy_profile_main_faction = await context.declare(
    "philosophy_profile_main_faction",
    generatePhilosophicalProfile("main_faction", "of the main faction", {
      central_idea,
      main_faction: main_factions.main_faction,
    })
  )

  const philosophy_profile_affirmative_subculture = await context.declare(
    "philosophy_profile_affirmative_subculture",
    generatePhilosophicalProfile(
      "affirmative_subculture",
      "of the affirmative subculture within the main faction",
      {
        central_idea,
        main_faction: main_factions.main_faction,
        philosophy_profile_main_faction,
        affirmative_subculture: main_factions.affirmative_subculture,
      }
    )
  )

  const philosophy_profile_counter_culture = await context.declare(
    "philosophy_profile_counter_culture",
    generatePhilosophicalProfile("counter_culture", "of the counter culture", {
      central_idea,
      counter_culture: main_factions.counter_culture,
    })
  )

  const factions = {
    main_faction: {
      // @ts-ignore
      ...main_factions.main_faction,
      philosophy_profile: philosophy_profile_main_faction,
    },
    affirmative_subculture: {
      // @ts-ignore
      ...main_factions.affirmative_subculture,
      philosophy_profile: philosophy_profile_affirmative_subculture,
    },
    counter_culture: {
      // @ts-ignore
      ...main_factions.counter_culture,
      philosophy_profile: philosophy_profile_counter_culture,
    },
  }

  // -------------------------
  // Character Arcs

  // refinement protagonist

  const protagonist_refined_faction_relations = await context.declare(
    "protagonist_refined_faction_relations",
    // generateProtagonistFactionRelations({
    //   central_idea,
    //   protagonist,
    //   factions,
    //   previous_description: protagonist_faction_relations,
    // })
    jsonRequest({
      systemCore,
      prompt: endent`
        We're writing a fantasy short story, ca. 20k words.

        Here's what we have to far:

        ${JSON.stringify(
          {
            central_idea,
            protagonist,
            factions,
          },
          undefined,
          3
        )}

        What we need now is an updated description of how the main character relates to the factions.

        Please respond fully in JSON format.

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
  )

  // ---------------------------------------------------------------------
  // Outline: List of chapters and sections and their strategic roles

  // ---------------------------------------------------------------------
  // Draft: Meta-Description of the paragraphs and their strategic role

  // ---------------------------------------------------------------------
  // Written Paragraphs

  // Done

  context.save()
}
