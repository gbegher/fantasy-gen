# Fantasy-Gen

Automated generation of fantasy novels using the ChatGPT API. The goal is to implement a process that generates fantasy stories without any human intervention. A more detailled description can be found under [module architecture](#module-architecture)

## How to run

Create a `.env` file that contains

```
OPENAI_ORG="...your OpenAI org id"
OPENAI_API_KEY="...your API key"
```

Then the usual

```
npm i
npm run play
```

The results will be in `./.state`.

### Sidenote

This is only a snapshot of a part of my personal "workbench", a typescript monorepo that I use for my personal experiments. I've not yet implemented an automated publishing process but still wanted to share my progress. So this will most likely not reflect the current state of the project.

## Context

The central idea here is that while LLMs such as ChatGPT can quickly generate a lot of text, they are currently not capable of producing high quality prose and narratives. Instead, they often generate an uninteresting sea of words and cookie-cutter plotlines. One of the issues seems to be that LLMs are not capable to capture the highly intraconnected nature of long-form texts such as novels and short stories: In a text written by a real world author every word/sentence/paragraph/chapter serves a purpose. At least ideally.

This can partly be improved by prompting for self-explanations. But due to the combinatoric explosion that comes with interconnectedness this is only a partial solution.

So my approach is to compose a highly interconnected network of prompts, following a multi-layer model. In short: Instead of using a single prompt to generate a lot of text, we use a lot of prompts for every single word.

## Development approach

- We use a declarative approach inspired by infrastructure-as-code tools to define the network. It makes use of memoization to reduce costs.
- Prompts are added one-by-one to the network.
- A small number of novels are developed in parallel to ensure both quality and diversity of the output.

## Module Architecture

Here's a description of the most important parts of the codebase:

- `/src/util/context.ts` - Since I expect that in the end hundreds of prompts will contribute to a single story, it is not economic to freshly regenerate the whole content with each update: The API provided by OpenAI is not cheap. So I created an ad-hoc implementation of a **resource declaration framework** inspired by infrastructure-as-code tools such as `pulumi` and `AWS-CDK`. It makes use of memoization and permeates the state to a backend (currently the filesystem).
- `/src/resources/json-request.ts` - A resource constructor for resources that represent a single request to the ChatGPT API. It expects and parses a response in form of a JSON string and also provides some automated error recovery in case of incorrectly formatted responses.
- `/src/resources/schema-request.ts` - A construct built on top of `json-request`. It creates JSON-resources based on a schema description. This allows for directly specifying schemas and intermediate DSLs, greatly reducing prompt-boilerplate and making the code more manageable.
- `/src/fantasy-generator/index.ts` - This is the actual network of prompts currently under development.
- `/src/main.ts` - The central entrypoint. It currently declares four novels, each with a different theme. It can be run by using `npm run play`.
- `/.state` - This folder contains the current state of the output generated so far. It is used by the resoure declaration framework when loading and saving the state.
- `/.logs` - This should contain a log of all requests made during a run.

## Disclaimer

This is currently in an early state and requires a cleanup/refactoring. Especially the resource declaration framework is something that I threw together in an evening or two. Also the JSON-request error recovery stills need some improvements such as increasing token limit in case of failed attempts, etc.
