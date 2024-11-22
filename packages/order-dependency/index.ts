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

  for (const options of optionSeries) {
    const shiftedQuestion: Question = { name: question.name, question: question.question, options }
    await getAnswers(shiftedQuestion, nEvals, optionPrefixes, model)
  }
}

export async function getAnswers(
  question: Question,
  nEvals: number,
  optionPrefixes: OptionPrefixes,
  model: ModelName
) {
  // Ask the same question nEvals times so we can measure stability
  const rawAnswers = await Promise.all(
    Array.from({ length: nEvals }, async () => {
      // Retry up to 3 times (for llama, because JSON output is unreliable)
      for (let i = 0; i < 3; i++) {
        try {
          return await answerQuestion(question, optionPrefixes.prefixes, model)
        } catch (error) {
          if (i === 2) throw error
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
