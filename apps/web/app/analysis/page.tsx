import { Answer, dbClient } from "@repo/db"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AnalysisCharts } from "./Analysis"

export default async function AnalysisPage() {
  const questions = await dbClient.multipleChoiceQuestion.findMany()
  const answers = await dbClient.answer.findMany()

  const answersByPrimaryKeys: Record<
    string,
    Record<string, Record<string, Record<string, Answer[]>>>
  > = {}

  // We're going to calculate the values we'll show in the UI here
  const optionKeysByQuestionName: Record<string, string[]> = {}

  for (const answer of answers) {
    const optionsKey = JSON.stringify(answer.options)

    if (!optionKeysByQuestionName[answer.questionName]) {
      optionKeysByQuestionName[answer.questionName] = []
    }

    if (!optionKeysByQuestionName[answer.questionName]!.includes(optionsKey)) {
      optionKeysByQuestionName[answer.questionName]!.push(optionsKey)
    }

    if (!answersByPrimaryKeys[answer.questionName]) {
      answersByPrimaryKeys[answer.questionName] = {}
    }

    const questionGroup = answersByPrimaryKeys[answer.questionName]!

    if (!questionGroup[answer.modelName]) {
      questionGroup[answer.modelName] = {}
    }
    const modelGroup = questionGroup[answer.modelName]!

    if (!modelGroup[answer.optionType]) {
      modelGroup[answer.optionType] = {}
    }

    const optionTypeGroup = modelGroup[answer.optionType]!

    if (!optionTypeGroup[optionsKey]) {
      optionTypeGroup[optionsKey] = []
    }

    optionTypeGroup[optionsKey].push(answer)
  }

  const stabilityScores: Record<
    string,
    Record<
      string,
      Record<
        string,
        Record<
          number,
          {
            stability: number
            mostCommonAnswer: string
            options: string[]
          }
        >
      >
    >
  > = {}
  const consistencyScores: Record<string, Record<string, Record<string, number>>> = {}

  for (const [questionName, modelData] of Object.entries(answersByPrimaryKeys)) {
    for (const [modelName, optionTypeData] of Object.entries(modelData)) {
      if (!stabilityScores[modelName]) {
        stabilityScores[modelName] = {}
      }
      if (!stabilityScores[modelName][questionName]) {
        stabilityScores[modelName][questionName] = {}
      }

      for (const [optionType, optionsData] of Object.entries(optionTypeData)) {
        if (!stabilityScores[modelName][questionName][optionType]) {
          stabilityScores[modelName][questionName][optionType] = {}
        }

        // Calculate consistency across different option orders
        const answersByOrder: Record<string, string> = {}

        // First find the most common answer for each option order
        for (const [optionsKey, answers] of Object.entries(optionsData)) {
          const answerCounts: Record<string, number> = {}
          for (const answer of answers) {
            answerCounts[answer.text] = (answerCounts[answer.text] || 0) + 1
          }

          // Find the most common answer for this order
          let mostCommonAnswer = ""
          let maxCount = 0
          for (const [answer, count] of Object.entries(answerCounts)) {
            if (count > maxCount) {
              maxCount = count
              mostCommonAnswer = answer
            }
          }

          answersByOrder[optionsKey] = mostCommonAnswer
        }

        // Now calculate consistency across orders
        const orderAnswers = Object.values(answersByOrder)
        const crossOrderCounts: Record<string, number> = {}
        for (const answer of orderAnswers) {
          crossOrderCounts[answer] = (crossOrderCounts[answer] || 0) + 1
        }

        const mostCommonCount = Math.max(...Object.values(crossOrderCounts))
        const consistency = orderAnswers.length > 0 ? mostCommonCount / orderAnswers.length : 0

        if (!consistencyScores[questionName]) {
          consistencyScores[questionName] = {}
        }
        if (!consistencyScores[questionName][optionType]) {
          consistencyScores[questionName][optionType] = {}
        }
        if (!consistencyScores[questionName][optionType][modelName]) {
          consistencyScores[questionName][optionType][modelName] = consistency
        }

        for (const [optionsKey, answers] of Object.entries(optionsData)) {
          const answerCounts: Record<string, number> = {}
          for (const [index, answer] of answers.entries()) {
            answerCounts[answer.text] = (answerCounts[answer.text] || 0) + 1
          }

          const mostCommonCount = Math.max(...Object.values(answerCounts))
          const stability = mostCommonCount / answers.length
          const mostCommonAnswer = Object.keys(answerCounts)[0] || ""

          const optionIndex = optionKeysByQuestionName[questionName]!.indexOf(optionsKey)

          stabilityScores[modelName][questionName][optionType][optionIndex] = {
            stability,
            mostCommonAnswer,
            options: JSON.parse(optionsKey),
          }
        }
      }
    }
  }

  return (
    <div className="container mx-auto py-10 p-5 max-w-6xl">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-primary hover:text-primary/80">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AnalysisCharts
        questions={questions}
        stabilityScores={stabilityScores}
        consistencyScores={consistencyScores}
        answersByPrimaryKeys={answersByPrimaryKeys}
      />
    </div>
  )
}
