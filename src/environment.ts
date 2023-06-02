import * as dotenv from "dotenv"
import { OpenAIApi, Configuration } from "openai"

dotenv.config()

export const ROOT_DIR = __dirname

const OPENAI_ORG = process.env.OPENAI_ORG
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const configuration = new Configuration({
  organization: OPENAI_ORG,
  apiKey: OPENAI_API_KEY,
})

export const openai = new OpenAIApi(configuration)
