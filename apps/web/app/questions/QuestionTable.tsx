"use client"

import { motion } from "framer-motion"
import { MultipleChoiceQuestion } from "@repo/db"
import { Card } from "@/components/ui/card"

interface QuestionTableProps {
  questions: MultipleChoiceQuestion[]
}

export function QuestionTable({ questions }: QuestionTableProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 p-4 gap-4 text-sm text-primary/70">
        <div className="col-span-3 font-medium">Name</div>
        <div className="col-span-3 font-medium">Question</div>
        <div className="col-span-1 font-medium">Type</div>
        <div className="col-span-2 font-medium">Correct Answer</div>
        <div className="col-span-3 pl-3 font-medium">Options</div>
      </div>

      {questions.map((question, idx) => (
        <motion.div
          key={question.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: idx * 0.1,
          }}
        >
          <Card>
            <div className="grid grid-cols-12 p-4 gap-4 group hover:bg-primary/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="col-span-3 font-medium text-foreground/90">{question.name}</div>
              <div className="col-span-3 text-foreground/80">{question.question}</div>
              <div className="col-span-1 text-foreground/80">{question.type}</div>
              <div className="col-span-2 text-foreground/80">{question.correctAnswer}</div>
              <div className="col-span-3">
                <ul className="space-y-2.5">
                  {(question.options as string[]).map((option, index) => (
                    <li key={index}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: idx * 0.1 + index * 0.05,
                        }}
                        layoutId={`${question.name}-${index}`}
                      >
                        <div className="flex items-center space-x-3 text-muted-foreground/80 group-hover:text-foreground transition-all duration-200">
                          <div className="relative">
                            <span className="absolute inset-0 h-2 w-2 rounded-full bg-primary/40 blur-[2px] group-hover:bg-primary/60" />
                            <span className="relative h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary/80 transition-colors duration-200" />
                          </div>
                          <span className="text-sm">{option}</span>
                        </div>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
