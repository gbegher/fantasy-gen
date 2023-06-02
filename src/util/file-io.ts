import fs from "fs"
import path from "path"
import { ROOT_DIR } from "../environment"
import { JsonData } from "./json"

const PROJECT_PATH = "fantasy-gen"

const getFilename = (folder: string, filename: string) =>
  path.relative(ROOT_DIR, path.join(PROJECT_PATH, folder, filename))

export const writeFile = (folder: string, filename: string, content: {}) => {
  fs.writeFileSync(
    getFilename(folder, filename),
    JSON.stringify(content, undefined, 2)
  )
}

export const readFile = <T extends JsonData>(
  folder: string,
  filename: string
): T | undefined => {
  try {
    const content = fs.readFileSync(getFilename(folder, filename)).toString()

    return JSON.parse(content)
  } catch {
    return undefined
  }
}
