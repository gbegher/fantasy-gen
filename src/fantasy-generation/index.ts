import endent from "endent"

import { declareContext } from "../util/context"
import { constructors } from "../resources"
import {
  defineList,
  defineSchema,
  schemaRequest,
  twoStageSchemaRequest,
} from "../resources/schema-request"
import { characterArcSetup } from "./character-arcs"

export const createStory = async (
  name: string,
  general_instructions: string
) => {
  // ---------------------------------------------------------------------
  // Init

  const context = await declareContext(name, { ...constructors })

  // ---------------------------------------------------------------------
  // Layer 0: Abstract

  const { central_idea } = await schemaRequest(context, {
    name: "central_idea",
    input_information: {
      general_instructions,
    },
    schema: defineSchema({
      description: endent`
        A central idea for a fantasy story.
        The idea should not describe the plot.
        Just a an abstract idea or concept.
      `,
      items: {
        central_idea: endent`
          A description of the central idea.
          It should be two or three sentences long.
          If the instructions include additional requests, it can be longer.
        `,
      },
    }),
  })

  // ---------------------------------------------------------------------
  // Layer 1: Story Structure & Core Worldbuilding

  // --------------------------------------------
  // Worldbuilding

  const main_location = await schemaRequest(context, {
    name: "main_location_core",
    input_information: { central_idea },
    schema: defineSchema({
      description: endent`
        The main location for the story.
      `,
      items: {
        description: "A description of the main location",
        relation_to_central_idea: endent`
          The relation of the main location to the central idea.
          How does the central idea manifest or how is it represented by the location?
          Don't include any information about characters or factions.
        `,
      },
    }),
  })

  const central_factions_core = await schemaRequest(context, {
    name: "central_factions_core",
    input_information: {
      central_idea,
      main_location: main_location.description,
    },
    schema: defineSchema({
      description: endent`
        Three central factions in the society, each relating to the central idea in a differnt way.
      `,
      items: {
        main_faction: defineSchema({
          description: endent`
            They represent the dominant way to find a position to the central idea.
            They represent the status quo.
          `,
          items: {
            name: "the name of the faction",
            description: "A flavorful description of the main faction.",
            approach_to_central_idea:
              "A description of how the main faction relates to the central idea.",
          },
        }),
        affirmative_subfaction: defineSchema({
          description: endent`
            A subgroup within the main faction.
            They adhere to the same idea but do so in a different way.
          `,
          items: {
            name: "the name of the faction",
            description:
              "A flavorful description of a subfaction of the main faction that is aligned with the main faction.",
            unique_twist:
              "A description of how the subfactions factions approach to the central idea differs from the main factions",
          },
        }),
        counter_faction: defineSchema({
          description: endent`
            They represent a take on the central idea that goes against the main groups approach.
          `,
          items: {
            name: "the name of the faction",
            description: endent`
                A description of a faction that has a very differnt approach to the central idea.
                Its philosophy should mostly be a more positive take on the central idea.
              `,
            key_conflict:
              "A description of how this factions approach to the central idea clashes with the main factions approach.",
          },
        }),
      },
    }),
  })

  const main_faction_location_relation = await schemaRequest(context, {
    name: "main_faction_location_relation",
    input_information: {
      central_idea,
      main_location,
      main_faction: central_factions_core.main_faction,
    },
    schema: defineSchema({
      description: endent`
        The relation between the main faction and the main location
      `,
      items: {
        relation_to_main_location: endent`
          A description of how the main faction is related to the main location.
          How does this faction interact with the location? What is their role?
          Keep in mind that the main faction represents the dominant position regarding the central idea.
        `,
      },
    }),
  })

  const subfaction_location_relation = await schemaRequest(context, {
    name: "subfaction_location_relation",
    input_information: {
      central_idea,
      main_location,
      main_faction: {
        description: central_factions_core.main_faction,
        location_relation: main_faction_location_relation,
      },
      subfaction: central_factions_core.affirmative_subfaction,
    },
    schema: defineSchema({
      description: endent`
        The relation between the affirmative subfaction and the main location.
      `,
      items: {
        relation_to_main_location: endent`
          A description of how the affirmative subfaction is related to the main location.
          How does this faction interact with the location? What is their role?
          The relation should be an expression of:
            * How the subfaction relates to the central idea
            * How the subfaction relates to the main faction
          Avoid using meta terms like "affirmative subfaction", "central idea".
        `,
      },
    }),
  })

  const counter_faction_location_relation = await schemaRequest(context, {
    name: "counter_faction_location_relation",
    input_information: {
      central_idea,
      main_location,
      counter_faction: central_factions_core.counter_faction,
    },
    schema: defineSchema({
      description: endent`
        The relation between the counter and the main location.
      `,
      items: {
        relation_to_main_location: endent`
          A description of how the counter subfaction is related to the main location.
          How does this faction interact with the location? What is their role?
          Avoid using meta terms like "counter subfaction", "central idea" and "main location".
        `,
      },
    }),
  })

  const central_factions_location_relations = {
    main_faction_location_relation,
    subfaction_location_relation,
    counter_faction_location_relation,
  }

  const main_location_summary_with_relations = await schemaRequest(context, {
    name: "main_location_summary_with_relations",
    input_information: {
      central_idea,
      main_location,
      central_factions_core,
      central_factions_location_relations,
    },
    schema: defineSchema({
      description: endent`
        What we need now is to create a summary description of the main location based on this information.
        Don't mention the specific factions in this summary.
      `,
      items: {
        summary_main_location: endent`
          A summary of the main location based on the knowledge we have to far.
        `,
      },
    }),
  })

  const mythical_secret = await schemaRequest(context, {
    name: "mythical_secret",
    input_information: {
      central_idea,
      main_location,
      main_location_summary_with_relations,
    },
    schema: defineSchema({
      description: endent`
        What we need now is a mythical element that the reader discovers.
        It should be metaphysical in nature.
        It should provide some form of hidden twist or interpretation of the central idea itself.
        It should build on the central idea and be connected with the main location.
      `,
      items: {
        concept: endent`
          An abstract concept for a mythical secret.
          Avoid meta terms like "mythical secret" and only use in-world descriptions.
          Don't include references to the protagonists or characters actions.
        `,
        relation_to_central_idea: endent`
          A description of how the mythical secret relates to the central idea
        `,
      },
    }),
  })

  // --------------------------------------------
  // Story Structure

  const protagonist_core = await schemaRequest(context, {
    name: "protagonist_core",
    input_information: { central_idea },
    schema: defineSchema({
      description: endent`
        The core setup for the protagonist.
        It should be used to give the protagonist a motivation.
        It should not include plot details or anticipate character actions.
        It should also not include surface information such as appearance, name, etc.
        Rather it describes the protagonists psychological setup.
      `,
      items: {
        inner_need: "Their inner need",
        obstacle: "A description of why they can't have it",
        transformation:
          "A description of how they transform in order to resolve their need.",
        relation_to_central_idea:
          "An explanation of how the character setup relates to the central idea of the story",
      },
    }),
  })

  // ----

  // const mythical_facts = await schemaRequest(context, {
  //   name: "mythical_facts",
  //   input_information: {
  //     central_idea,
  //     main_location,
  //     mythical_secret,
  //     central_factions_core,
  //     central_factions_location_relations,
  //   },
  //   schema: defineSchema({
  //     description: endent`
  //       We want to introduce some facts about the world of our story.
  //       The goal is to create a space of development for the characters and of discovery for the reader.
  //     `,
  //     items: {
  //       aspects_of_the_central_idea: defineSchema({
  //         description: endent`
  //           Some facts about our world that relate to the central idea.
  //           They should be described from an "in-world" perspective but with auctorial knowledge.
  //           These should be specific things, historic events, places, persons, etc.
  //           Also consider the relation of the main faction to the central idea.
  //           Pick highly creative choices.
  //         `,
  //         items: {
  //           common_knowledge: defineList({
  //             description:
  //               "A list of three facts that relate to the central idea",
  //             schema:
  //               "A fact that is commonly known in the world of the novel.",
  //           }),
  //           hidden: defineList({
  //             description: "A list of two facts",
  //             schema: "A lesser known fact about the world.",
  //           }),
  //           mastery: defineList({
  //             description: "A list of two facts",
  //             schema: "A fact that only a selected few know about the world",
  //           }),
  //         },
  //       }),
  //       aspects_of_the_mythical_secret: defineSchema({
  //         description: endent`
  //           Some facts about our world that relate to the mythical secret.
  //           They should be described from an "in-world" perspective but with auctorial knowledge.
  //           These should be specific things, historic events, places, persons, etc.
  //           Pick things that don't alter or add anything new to the mythical secret.
  //           Rather add flavorful and creative detail.
  //         `,
  //         items: {
  //           in_plain_sight: defineList({
  //             description:
  //               "A list of two facts that are visible to those who know where to search.",
  //             schema:
  //               "A fact about the world that can be used to deduce some knowledge about the mythical secret.",
  //           }),
  //           revelatory: defineList({
  //             description:
  //               "A list of two facts that are deeply hidden within the world.",
  //             schema: endent`
  //               A fact about the world that hints at the core of the mythical secret.
  //               Explain for each how they relate to the mythical secret.
  //               It should not fully reveal the secret.`,
  //           }),
  //         },
  //       }),
  //     },
  //   }),
  // })

  // const { character_arc_setup } = await characterArcSetup(context, {
  //   identifier: "protagonist",
  //   character_concept: endent`
  //     This character is the protagonist of our story.
  //     For now, we only need a rough setup or idea without specifying any details (name, appeareance, plot points, etc.).
  //     Make sure the character setup contains interesting ideas that the reader can relate to.
  //   `,
  //   background_information: {
  //     central_idea,
  //     main_location_summary_with_relations,
  //     mythical_secret,
  //   },
  // })

  // const knowledge_journey = await schemaRequest(context, {
  //   name: "knowledge_journey",
  //   input_information: {
  //     central_idea,
  //     main_location,
  //     mythical_secret,
  //     central_factions_core,
  //     mythical_facts,
  //   },
  //   schema: defineSchema({
  //     description: endent`
  //       Here's a model for a narrative arc that describes a journey of discovery for the main character.
  //       Please create a template for an outline.
  //       It should not specify anything concrete about the character.
  //       But please describe everything in relation to the specific central idea, main location and mythical secret we already have.
  //       So instead of just referencing these meta concepts by name, describe the specific aspects that apply in each step.

  //       The overall arc of discovery should be guided by the mythical facts.
  //     `,
  //     items: {
  //       introduction: endent`
  //         Describe the protagonists initial relation to the central idea in abstract terms.
  //       `,
  //       development: defineSchema({
  //         description: endent`
  //           This stage entails a phase of learning and discovery for the character.
  //         `,
  //         items: {
  //           apprenticeship: endent`
  //             In this part, the character enters a setting where they learn about the central idea.
  //           `,
  //           progress_and_success: endent`
  //             In this part, initial progress is displayed, culminating in a successful application.
  //           `,
  //           trial_and_transformation: endent`
  //             In this part, the character faces a challenge but it turns out they are not prepared.
  //             A fateful failure reveals parts of the mythical secret to the character.
  //           `,
  //         },
  //       }),
  //       climax:
  //         "The character reaches the peak of their mastery of the central idea.",
  //       conclusion:
  //         "The character's newfound mastery of the central idea through the mythical secret and its impact on their personal growth and development.",
  //     },
  //   }),
  // })

  // const narrative_structure = await twoStageSchemaRequest(context, {
  //   name: "narrative_structure",
  //   input_information: {
  //     central_idea,
  //     central_factions_core,
  //     main_location_summary_with_relations,
  //     mythical_secret,
  //     mythical_facts,
  //   },
  //   schema: defineSchema({
  //     description: endent`
  //       A narrative structure that follows a four-stage model:
  //       1. Introduction: Establish setting, main characters, tone, and initial conflict or hint of the central theme.
  //       2. Development: Set up the main character's position in the world, their backstory, their motivations, deepen the story, develop the main conflict, and expand the world and its fantastical elements.
  //       3. Climax: Bring the story to its dramatic peak, featuring the main character's confrontation with their greatest challenge, realization, or transformation.
  //       4. Conclusion: Resolve the central conflict, address the consequences of the climax, and bring the story to a satisfying close.

  //       The structure should utilize all the information that we already have about our story and setting.
  //     `,
  //     items: {
  //       introduction: endent`
  //         Provide an opening scene that establishes the setting, introduces the main characters, sets the tone, and hints at the central theme, incorporating the given input information.
  //       `,
  //       development: defineSchema({
  //         description: endent`
  //           Focus on developing the character's backstory, motivations, and deepening the narrative.
  //         `,
  //         items: {
  //           character_setup: endent`
  //             Write a narrative sequence that describes the main character's position in the world, their backstory, and their motivations, using the provided input information.
  //           `,
  //           world_and_conflict_development: endent`
  //             Write rough outline for a series of narrative sequences that progress the primary conflict.
  //           `,
  //         },
  //       }),
  //       climax: endent`
  //         Write a scene that brings the story to its dramatic peak, where the main character confronts their greatest challenge or undergoes a significant realization or transformation, using the provided input information.
  //       `,
  //       conclusion: endent`
  //         Write a narrative sequence that resolves the story. It should:
  //           * Address the consequences of the climax
  //           * Brings the story to a satisfying close
  //           * Reflect on the character's growth and the impact of the story's events on the world or the characters.
  //       `,
  //     },
  //   }),
  // })

  // const story_structure = await schemaRequest(context, {
  //   name: "story_structure",
  //   input_information: {
  //     central_idea,
  //     mythical_secret,
  //     central_factions_core,
  //     main_location,
  //   },
  //   schema: defineSchema({
  //     description: endent`
  //       Here's a model for the story structure:

  //       Introduction:
  //         Purpose:
  //           Establish setting, main characters, tone, and initiate a key event that sets the story in motion.
  //       Development:
  //         First Part (Tensions in the status quo):
  //           Purpose:
  //             Explain how the main character is settled into the world.
  //             How does the key event cause tension for them?
  //         Second Part (Transition):
  //           Purpose:
  //             A new world opens up to the character (in a metaphorical sense)
  //             This part describes the transition of the character into this world.
  //             Showcase an example where the main character excels in the new world.
  //           Possible Tools:
  //             Introduction of magical elements
  //             encounters with otherworldly creatures or phenomena
  //             mentor figures guiding the main character
  //             the character demonstrating their unique abilities or skills
  //         Third Part (Clash with Reality):
  //           Purpose:
  //             After initial success, the main character fails horribly, either due to or causing the main conflict.
  //           Possible Tools:
  //             A significant setback or challenge
  //             A confrontation with an antagonist or opposing force
  //             An event that tests the character's beliefs and abilities
  //       Climax:
  //         Purpose:
  //           Bring the story to its dramatic peak,
  //           featuring the main character's confrontation with their greatest challenge,
  //           realization, or transformation.
  //         Possible Tools:
  //           A major battle or confrontation
  //           A pivotal decision or action
  //           A revelation that changes the character's perspective
  //           An event that tests the character's beliefs and abilities
  //       Conclusion:
  //         Purpose:
  //           Resolve the central conflict,
  //           address the consequences of the climax,
  //           and bring the story to a satisfying close.
  //         Possible Tools:
  //           Reflection on the character's growth,
  //           resolution of subplots,
  //           exploration of the impact of the story's events on the world or the characters,
  //           or a return to the initial setting with new insights or transformations.

  //       We will now come up with an initial outline based on this structure.
  //     `,
  //     items: {
  //       introduction: "a short summary of what happens in the introduction",
  //       development: "a short summary of what happens during the development",
  //       climax: "a short summary of what happens during the climax",
  //       conclusion: "a short summary of how the story is concluded",
  //     },
  //   }),
  // })

  // ---------------------------------------------------------------------
  // Layer 2: Plot & Subblots

  // ---------------------------------------------------------------------
  // Done

  context.save()
}
