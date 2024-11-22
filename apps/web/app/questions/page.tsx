import { dbClient } from "@repo/db"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { QuestionTable } from "./QuestionTable"

export default async function Questions() {
  const questions = await dbClient.multipleChoiceQuestion.findMany()

  return (
    <div className="container mx-auto p-5 max-w-6xl">
      <Breadcrumb className="">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-primary hover:text-primary/80">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Questions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="pt-10">
        <QuestionTable questions={questions} />
      </div>
    </div>
  )
}
