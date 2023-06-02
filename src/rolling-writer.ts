import endent from "endent"
import {
  descriptionCharacters,
  outlineAct1,
  outlineChapter1,
} from "./data/writer-experiments"

import { constructors } from "./resources"
import { jsonRequest } from "./resources/json-request"
import { declareContext } from "./util/context"
import { JsonData } from "./util/json"

// ----------------------------------------------------------------------------
// Helper
// ----------------------------------------------------------------------------

type Primer = {
  current_step: ChapterStep
  expectations: {
    long_term: Expectation[]
    short_term: Expectation[]
  }
  tone: string
  goal_for_next_paragraph: string
}

type ChapterStep = {
  number: string
  content: string
  inner_state: string
  central_point: string
}

type Expectation = {
  expectation: string
}

const expectationInstructions = (primer: {
  latest_paragraph: string
  current_expectations: string
}) => endent`
  ${JSON.stringify({ primer }, undefined, 2)}

  Your task: Analyze the latest_paragraph and update the current_expectations as follow:

  expectations:
    What it is:
      In the primer, there's long term expectations and short term expectations.
      long_term expecations are bound to be resolved later in the novel.
      short_term expectations are bound to be resolved within the current chapter.
    How to update:
      If the latest paragraph resolved an expectation, remove the respective exectation from the list.
      If the latest paragraph created a new exceptation, summarize it and add to to either long_term or short_term expectations.

  Please respond with a JSON object according to the following 'Response' type definition:

  ---
  type Response = {
    long_term: Expectation[]
    short_term: Expectation[]
  }
  type Expectation = {
    expectation: string
  }
  ---

  Your response should start with { and end with }:

  {
    "long_term": [
      { "expectation": "..." },
      ...
    ],
    "short_term": [
      { "expectation": "..." },
      ...
    ]
  }
`

const initialPrimer: Primer = {
  current_step: {
    number: "step-1.1",
    content:
      "Elysia is the leader of her section at the museum and the leading expert in ancient languages and artifacts. She oversees the works on an upcoming exhibition, instructing her assistants and ensuring that everything is perfect.",
    inner_state:
      "Elysia feels proud of her professional accomplishments but also pressured to maintain her reputation.",
    central_point:
      "Establish Elysia's status as an expert and her dedication to her work.",
  },
  expectations: {
    long_term: [],
    short_term: [],
  },
  tone: "to be decided",
  goal_for_next_paragraph: "",
}

const createNewPrimer = (
  backgroundInformation: string,
  globalOutline: string,
  chapterOutline: string,
  primer?: Primer,
  latest_paragraph?: string
) => endent`
  -- Background Information:
    ${backgroundInformation}

  -- Chapter Outline:
    ${chapterOutline}

  -- Type definitions

  type Primer = {
    current_step: ChapterStep
    tone: string
    goal_for_next_paragraph: string
  }

  type ChapterStep = {
    number: string
    content: string
    inner_state: string
    central_point: string
  }

  -- Instructions:

    Your task is to create a new primer by updating the current primer.
    The current primer was used to write the latest paragraph.
    The new primer will be used to write the next paragraph.

  -- Current primer:

    ${
      primer
        ? JSON.stringify(primer, undefined, 2)
        : "There's no primer yet. This will be the first one."
    }

  -- latest paragraph:

    ${latest_paragraph}

  -- update instructions:

    Here's a description of how to update the primer

    * current_step:

      If there's not primer yet, this should be step-1.1.
      This is an object of type 'ChapterStep'.
      Take this from the chapter outline.

    * tone:

      Pick a tone for the next paragraph.
      It should match to the central_point and inner_state of the current step.

    * goal for paragraph:

      The narrative goal for the next paragraph.
      It should contribute to the central point of the current step.
      But it does not necessarily need to conclude the current step.
      If this will be the first paragraph, make sure that the goal includes a hook to get the reader into the story.

  -- Response format:

  Please respond with a JSON object as follows. The response should start with { and end with }:

  {
    "primer": ... // place the new object of type 'Primer' here
  }
`

const writeParagraph = (
  backgroundInformation: string,
  chapterOutline: string,
  primer: Primer = initialPrimer,
  latest_paragraph: string = "[Nothing was written yet, this will be the first paragraph]"
) => endent`
  -- Background Information:
    ${backgroundInformation}

  -- Outline for the current chapter:
    ${chapterOutline}

  -- Primer:
    ${JSON.stringify(primer, undefined, 2)}

  -- Latest paragraph:
    ${latest_paragraph}

  -- Writing guideline:

    General:
      * There's no need to conlcude the current step with this paragraph.
      * Don't rush things and take your time to slowly build up everything.
      * Don't put everything you have in mind about newly introduced elements into a single paragraph. Instead, note what you left unsaid in "strategic considerations" as explained forther down.
      * Always consider who and what a character knows at a given point in time.

    Apply the following:
      * Focus on the atmosphere, unique characteristics, and subtle details of the setting.
      * Convey the thoughts, feelings, and sensory perceptions of the character as they explored or encountered the setting.
      * "Show" the character's emotional responses through their observations, actions, and reactions, rather than directly "telling" the reader how they felt.
      * Use original and imaginative descriptions and metaphors to create a vivid and engaging scene.
      * When introducing new characters, consider if the reader already knows the character and don't reference their name if this is not the case. Character introductions also should adhere to "show don't tell". Use descriptions from the POV characters perspective and utilize dialogue.

    Avoid thee following:
      * Phrasings or elements that evoke children's fairy tales.
      * Relying on common or often used figures of speech and clichéd phrases and descriptions.
      * Explicitly "telling" the reader the character's emotions instead of "showing" them through descriptions and actions.

  -- Instructions:

  Please write the next paragraph according to the primer and the chapter outline.
  This new paragraph should seamlessly follow the latest paragraph.
  Follow the writing guideline.

  Please respond with a JSON object as follows. Your response should start with { and end with }:

  {
    new_paragraph: "...write new paragraph here"
  }
`

// ----------------------------------------------------------------------------
// Core implementation
// ----------------------------------------------------------------------------

export type RollingWriterProps = {
  backgroundInformation: string
  globalOutline: string
  chapterOutline: string
}

const systemCore = endent`
  You are a creative assistant for writing fantasy novels and short stories.
  You always respond in JSON.
`

export const rollingWriter = async (
  contextName: string,
  props: RollingWriterProps
) => {
  const context = await declareContext(contextName, { ...constructors })

  const { primer: initialPrimer } = await context.declare(
    "initial-primer",
    jsonRequest<{ primer: Primer }>({
      systemCore,
      prompt: createNewPrimer(
        props.backgroundInformation,
        props.globalOutline,
        props.chapterOutline
      ),
    })
  )

  const { new_paragraph: firstParagraph } = await context.declare(
    "first-paragraph",
    jsonRequest<{ new_paragraph: string }>({
      systemCore,
      prompt: writeParagraph(
        props.backgroundInformation,
        props.chapterOutline,
        initialPrimer
      ),
    })
  )

  return context.save()
}

export const writerExperiment = () => {
  rollingWriter("witches-test-02", {
    backgroundInformation: endent`
      Characters:
        ${descriptionCharacters}
    `,
    globalOutline: outlineAct1,
    chapterOutline: outlineChapter1,
  })
}
