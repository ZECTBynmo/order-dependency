import { type ModelName, type Question, answerQuestion } from "@repo/ai"
import { dbClient } from "@repo/db"

export interface OptionPrefixes {
  name: string
  prefixes: string[]
}

function shiftOptions(options: string[], numShifts: number) {
  const len = options.length
  return options.map((_, index) => options[(index + numShifts) % len])
}

export async function evaluateOrderDependency({
  question,
  nEvals,
  optionPrefixes,
  model,
}: {
  question: Question
  nEvals: number
  optionPrefixes: OptionPrefixes
  model: ModelName
}) {
  const originalOptions = question.options
  const optionSeries = [
    originalOptions,
    shiftOptions(originalOptions, 1),
    shiftOptions(originalOptions, 2),
    shiftOptions(originalOptions, 3),
  ]

  for (const index in optionSeries) {
    const options = optionSeries[index]
    const shiftedQuestion: Question = {
      name: question.name,
      question: question.question,
      options,
    }
    await getAnswers(shiftedQuestion, nEvals, optionPrefixes, Number(index), model)
  }
}

export async function getAnswers(
  question: Question,
  nEvals: number,
  optionPrefixes: OptionPrefixes,
  optionIndex: number,
  model: ModelName
) {
  const MAX_RETRIES = 10
  // Ask the same question nEvals times so we can measure stability
  const rawAnswers = await Promise.all(
    Array.from({ length: nEvals }, async () => {
      // Retry a few times (for llama, because JSON output is unreliable)
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          return await answerQuestion(question, optionPrefixes.prefixes, model)
        } catch (error) {
          if (i === MAX_RETRIES - 1) throw error
          console.log(`Attempt ${i + 1} failed, retrying...`)
        }
      }
    })
  )

  // Push the results into postgres
  rawAnswers.forEach(async (rawAnswer, index) => {
    if (!rawAnswer) return

    const answer = {
      question: {
        connect: {
          name: question.name,
        },
      },
      modelName: model,
      optionType: optionPrefixes.name,
      options: question.options,
      optionIndex,
      text: rawAnswer,
      index: index,
    }

    await dbClient.answer.upsert({
      where: {
        questionName_modelName_optionType_options_index: {
          questionName: question.name,
          modelName: model,
          optionType: optionPrefixes.name,
          options: question.options,
          index: index,
        },
      },
      create: answer,
      update: {
        text: rawAnswer,
      },
    })
  })
}
