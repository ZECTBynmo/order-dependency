import Instructor from "@instructor-ai/instructor"
import OpenAI from "openai"
import { z } from "zod"

export interface Question {
  name: string
  question: string
  options: string[]
}

export type ModelName = "llama" | "gpt4mini" | "gpt4o"

const oai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const llama = new OpenAI({
  baseURL: "http://localhost:1234/v1",
})

const gptClient = Instructor({
  client: oai,
  mode: "TOOLS",
})

const llamaClient = Instructor({
  client: llama,
  mode: "MD_JSON",
})

const systemPrompt = `
You are a helpful assistant that can answer questions. You will be given a question and a list of options. Your task is to select the best answer from the options.
`

export async function answerQuestion(
  question: Question,
  optionPrefixes: string[],
  model: ModelName
) {
  const userPrompt = `
  Question: ${question.question}
  Options:
    ${question.options.map((opt, i) => `${optionPrefixes[i]} ${opt}`).join("\n    ")}

  Your answer must be in the following format:

  {
    "answer": "The answer"
  }

  Answers must be the full text of the option, not just the prefix.

  The answer must be one of the options: ${question.options.map((opt) => `"${opt}"`).join(", ")}
  `

  const answerSchema = z.object({
    answer: z.enum(question.options as [string, ...string[]]),
  })

  const clients = {
    gpt4mini: gptClient,
    gpt4o: gptClient,
    llama: llamaClient,
  }

  const models = {
    gpt4mini: "gpt-4o-mini",
    gpt4o: "gpt-4o",
    llama: "llama-3.2-3b-instruct",
  }

  const { answer } = await clients[model].chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: models[model],
    temperature: 0.9,
    response_model: {
      schema: answerSchema,
      name: "Answer",
    },
  })

  return answer
}
