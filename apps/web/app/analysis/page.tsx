import { Answer, dbClient, getCorrectAnswerByOptionIndex } from "@repo/db"
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
  const correctAnswerByOptionIndex = await getCorrectAnswerByOptionIndex()

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

      <AnalysisCharts correctAnswerByOptionIndex={correctAnswerByOptionIndex} />
    </div>
  )
}
