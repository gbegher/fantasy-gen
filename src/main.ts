import endent from "endent"

import { logger } from "./util/logging"
import { createStory } from "./fantasy-generation"
import { writerExperiment } from "./rolling-writer"
import { writerExperiment2 } from "./rolling-writer2"

const main = async () => {
  await Promise.all([
    createStory(
      "shifting-realities",
      endent`
        The central idea should take on a constructivist/postmodern perspective.
        Choose a topic other than gender.
        And it should be centered around characters and not an epic plot.
        Tagline: living in a world with shifting realities
      `
    ),
    // createStory(
    //   "temptation-of-glory",
    //   `
    //   The central idea should take on a constructivist/postmodern perspective.
    //   Choose a topic other than gender.
    //   And it should be centered around characters and not an epic plot.
    //   Tagline: temptations of glory
    //   `
    // ),
    // createStory(
    //   "necropolis",
    //   `
    //   The central idea should take on a constructivist/postmodern perspective.
    //   Choose a topic other than gender.
    //   It should be centered around characters and not an epic plot.
    //   Title: Beyond the raven queen's necropolis
    //   Theme: Grief and loss
    //   Include the raven queen in the central idea and explain how she relates to the ide.
    //   Also include her necropolis in the central idea
    //   `
    // ),
    // createStory(
    //   "mists-of-time",
    //   `
    //   The central idea be about conflicting ideas about how to record history.
    //   And it should be centered around characters and not an epic plot.
    //   Tagline: all meaning dissolve in the mists of time
    //   Constraint: It should not be about grief and loss.
    //   `
    // ),
    // writerExperiment(),
    // writerExperiment2(),
  ])

  logger.writeLog()
}

main()
