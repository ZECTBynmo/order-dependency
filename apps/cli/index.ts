import { ModelName } from "@repo/ai"
import { dbClient } from "@repo/db"
import { evaluateOrderDependency } from "@repo/order-dependency"
import { questions } from "./questions"

async function populateQuestions() {
  console.log("Starting database population...")

  try {
    for (const question of questions) {
      console.log("Creating question:", question.name)
      await dbClient.multipleChoiceQuestion.upsert({
        where: {
          name: question.name,
        },
        create: {
          name: question.name,
          question: question.question,
          options: question.options,
        },
        update: {},
      })
    }

    console.log("All questions created successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error creating questions:", error)
    process.exit(1)
  }
}

async function evaluate() {
  const models: ModelName[] = ["gpt4mini", "gpt4o", "llama"]
  const optionPrefixes = [
    { name: "Lettered Options", prefixes: ["A. ", "B. ", "C. ", "D. "] },
    { name: "Numbered Options", prefixes: ["1. ", "2. ", "3. ", "4. "] },
    { name: "Bullet Points", prefixes: ["- ", "- ", "- ", "- "] },
  ]

  const NUM_EVALS_PER_TEST = 5

  for (const question of questions) {
    for (const model of models) {
      for (const optionPrefix of optionPrefixes) {
        await evaluateOrderDependency({
          question,
          nEvals: NUM_EVALS_PER_TEST,
          optionPrefixes: optionPrefix,
          model,
        })
      }
    }
  }
}

const command = process.argv[2]

const handlers = {
  populate: populateQuestions,
  evaluate: evaluate,
} as const

async function run() {
  if (typeof handlers[command as keyof typeof handlers] === "function") {
    try {
      await handlers[command as keyof typeof handlers]()
    } catch (error) {
      console.error("Fatal error:", error)
      await dbClient.$disconnect()
      process.exit(1)
    }
  } else {
    console.error(`Unknown command: ${command}`)
    process.exit(1)
  }
}

run()

process.stdin.resume()

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Cleaning up...")
  await dbClient.$disconnect()
  process.exit(0)
})
