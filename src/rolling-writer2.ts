import endent from "endent"
import { constructors } from "./resources"
import { jsonRequest } from "./resources/json-request"
import { Context, declareContext } from "./util/context"

import {
  descriptionCharacters,
  outlineChapter1,
} from "./data/writer-experiments"
const systemCore = endent`
  You are a creative assistant for writing fantasy novels and short stories.
  You always respond in JSON.
`

const sectionPrimerPrompt = (props: {
  background_information: string
  chapter_outline: string
  step_to_exemplify: number
}) => endent`
  Here's some background information:

  ${props.background_information}

  Here's an outline for a chapter of our story

  ${props.chapter_outline}


  Your task:

  For this outline, break down step number ${props.step_to_exemplify} into a section primer.
  A section primer is a structured breakdown of a section of a scene in a narrative, meant to guide a writer in crafting their prose. It includes the following elements:

  Content Description:
    A brief summary of the specific events, actions, or details that the paragraphs will cover.
    It provides the main focus of this particular section.
  Purpose:
    The main objective of this section within the scene, e.g., to create tension, provide exposition, reveal character motivations, etc.
  Relation to Scene Goal:
    A brief description of how this section contributes to the overall goal of the scene, ensuring cohesion and purpose within the larger scene.
  Character(s):
    A list of the characters involved in this section.
    For each character it includes any relevant aspects of their emotions, thoughts, or actions that should be conveyed.
  Emotional Arc:
    A summary of the emotional journey or development for the main character(s) in this section, aiding in conveying the right tone and pacing.
  Transitions:
    Guidance on how to connect this sectio to the following sections, helping the writer maintain a smooth flow between paragraph units.
    It can include for example notes on setups or hooks to place that can be picked up in the following paragraphs.
  Narrative Moments:
    A list of 2-5 key narrative elements within the unit, each with a set of instructions to guide the writer.
    These moments should be small in scale and correspond to only a few sentences in the final text.
    It contains:
      * Content:
        A description of the content of this narrative element.
      * Strategic goal:
        A descritpion of the goal this moment is intended to accomplish in terms of progressing the narrative
      * Literary technique:
        An choice of the main literary technique to apply for this narrative moment.
      Additionally it should include at least one or more of the following. Use only these that are most impactful for this moment:
      * Use of perspective:
        A description of a creative way of how the perspective of the POV character is used to convey the information for this narrative moment
      * Imagery:
        A description of the imagery to use and an explanation of why this serves the strategic goal.
      * Tone and atmosphere:
        A descrition of the tone to apply for this narrative moment and how it serves the strategic goal.
      * Pacing:
        Instruction on how the pacing for this moment should be.
`

const sectionPrimerJSON = (rawSectionPrimer: any) => endent`
  Here's a so called 'section primer'.

  ${rawSectionPrimer}


  Your task: Transform this information into a JSON object that follows the following typescript type:

  {
    "content_description": string,
    "purpose": string,
    "relation_to_scene_goal": string,
    "characters": object[],
    "emotional_arc": string,
    "transitions": string,
    "narrative_moments": {
      content: string,
      strategic_goal: string,
      literary_technique: string,
      additional_details: Partial<{
        use_of_perspective: string,
        imagery: string,
        tone: string,
        characterization: string,
        pacing: string,
      }>
    }[]
  }
`

const background_information = endent`
  Characters:
    ${descriptionCharacters}
`

const sectionPrimer = async (context: Context, step_to_exemplify: number) => {
  const rawPrimer = await context.declare(
    `chapter-1-section-primer-${step_to_exemplify}-raw`,
    jsonRequest({
      systemCore,
      prompt: sectionPrimerPrompt({
        background_information,
        chapter_outline: outlineChapter1,
        step_to_exemplify: step_to_exemplify,
      }),
    })
  )

  return await context.declare(
    `chapter-1-section-primer-${step_to_exemplify}`,
    jsonRequest({
      systemCore,
      prompt: sectionPrimerJSON(rawPrimer),
    })
  )
}

export const rollingWriter2 = async (contextName: string, props: {}) => {
  const context = await declareContext(contextName, { ...constructors })

  const primers = await Promise.all(
    [1, 2, 3].map((step_to_exemplify) =>
      sectionPrimer(context, step_to_exemplify)
    )
  )

  return context.save()
}

export const writerExperiment2 = () => rollingWriter2("witches-test-03", {})
