import { getCorrectAnswerByOptionIndex, opinionsByOptionIndex } from "@repo/db"
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
  const correctAnswerByOptionIndex = await getCorrectAnswerByOptionIndex()
  const opinionData = await opinionsByOptionIndex()

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
        correctAnswerByOptionIndex={correctAnswerByOptionIndex}
        opinionData={opinionData}
      />
    </div>
  )
}
