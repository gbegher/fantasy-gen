import { writeFile } from "./file-io"

const LOG_DIR = ".logs"

const log: any[] = []

const writeLogFile = (content: any) => {
  const now = new Date()
  const isoString = now.toISOString()
  const filename = isoString.replace(/:/g, "_").replace(/\./g, "_") + ".json"

  writeFile(LOG_DIR, filename, content)
}

export const logger = {
  push: (input: any) => {
    log.push(input)
  },
  all: (): any => log,
  print: () => JSON.stringify(log, undefined, 3),
  writeLog: () => writeLogFile(log),
}
