import { Answer, MultipleChoiceQuestion, Prisma, PrismaClient } from "@prisma/client"
import { config } from "dotenv"

config()

export const dbClient = new PrismaClient()

export type { MultipleChoiceQuestion, Answer }

export type NewMultipleChoiceQuestion = Prisma.MultipleChoiceQuestionCreateInput
export type NewAnswer = Prisma.AnswerCreateInput

export * from "./queries"
