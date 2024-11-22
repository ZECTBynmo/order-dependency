"use client"

import { JsonValue } from "@prisma/client/runtime/library"
import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { type ModelName } from "@repo/ai"
import { Answer } from "@repo/db"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Question {
  name: string
  question: string
  options: JsonValue
  createdAt: Date
  updatedAt: Date
}

interface AnalysisChartsProps {
  questions: Question[]
  consistencyScores: Record<string, Record<string, Record<string, number>>>
  stabilityScores: Record<
    string,
    Record<
      string,
      Record<
        string,
        Record<number, { stability: number; mostCommonAnswer: string; options: string[] }>
      >
    >
  >
  answersByPrimaryKeys: Record<string, Record<string, Record<string, Record<number, Answer[]>>>>
}

type OptionType = "Numbered Options" | "Lettered Options" | "Bullet Points"

export function AnalysisCharts({ stabilityScores, consistencyScores }: AnalysisChartsProps) {
  const [selectedModel, setSelectedModel] = useState<ModelName>("gpt4o")
  const [selectedStabilityOptionType, setSelectedStabilityOptionType] =
    useState<OptionType>("Numbered Options")
  const [selectedConsistencyOptionType, setSelectedConsistencyOptionType] =
    useState<OptionType>("Numbered Options")

  const stabilityGraphData = []
  for (const [questionName, modelData] of Object.entries(stabilityScores[selectedModel] || {})) {
    const questionEntry: {
      questionName: string
      [key: `order${number}`]: number
    } = {
      questionName: questionName.length > 30 ? questionName.substring(0, 30) + "..." : questionName,
      order1: 0,
      order2: 0,
      order3: 0,
      order4: 0,
    }

    Object.entries(modelData).forEach(([optionType, ordersData]) => {
      if (optionType !== selectedStabilityOptionType) return

      Object.entries(ordersData).forEach(([order, data]) => {
        const stability = data.stability
        const orderIndex = parseInt(order) + 1
        questionEntry[`order${orderIndex}`] = stability * 100
      })
    })

    stabilityGraphData.push(questionEntry)
  }

  const consistencyGraphData = []
  for (const [questionName, questionData] of Object.entries(consistencyScores || {})) {
    for (const [optionType, optionData] of Object.entries(questionData)) {
      const questionEntry: {
        questionName: string
        gpt4o: number
        gpt4mini: number
        llama: number
      } = {
        questionName:
          questionName.length > 30 ? questionName.substring(0, 30) + "..." : questionName,
        gpt4o: optionData.gpt4o ? optionData.gpt4o * 100 : 0,
        gpt4mini: optionData.gpt4mini ? optionData.gpt4mini * 100 : 0,
        llama: optionData.llama ? optionData.llama * 100 : 0,
      }

      if (optionType !== selectedConsistencyOptionType) continue
      consistencyGraphData.push(questionEntry)
    }
  }

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">The Order Dependency of LLMs</h2>
      </div>
      <div>
        <p className="mb-5">
          LLM output changes depending on input order, which model is used, and the specific prompt
          text.
        </p>
        <p className="mb-5">
          To explore this, we've asked several LLMs to answer{" "}
          <a className="underline" href="/questions">
            5 questions
          </a>{" "}
          with 4 different orderings of the options, and 3 different prefixes for the options.
        </p>
        <p className="mb-5">
          We chose questions that exercise different aspects of the LLM's capabilities. Some
          questions have specific correct answers, while others are opinion-based. Opinion-based
          questions are more likely to be affected by the order dependency problem, because the
          model is less likely to have been trained on the correct answer.
        </p>
        <p className="mb-5">We chose 3 different representations of the options in the prompt:</p>
        <ul className="list-disc list-inside mb-5">
          <li>
            <strong>Numbered</strong>: 1. Option 1, 2. Option 2, 3. Option 3, 4. Option 4
          </li>
          <li>
            <strong>Lettered</strong>: A. Option 1, B. Option 2, C. Option 3, D. Option 4
          </li>
          <li>
            <strong>Bulleted</strong>: - Option 1, - Option 4, - Option 3, - Option 2
          </li>
        </ul>
        <p className="text-gray-400 italic">Let's dig into some data to learn more</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Stability</h2>
        <p className="text-muted-foreground mb-6">
          As the order of options changes, the model can become more or less consistent in its
          responses to the same prompt. We're calling that stability here.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          We asked the same question with the same option order 5 times. This graph shows the
          stability of the model for each question across 4 different option orderings. Select the
          model and option type to view results.
        </p>

        <p className="text-muted-foreground mb-6 italic">
          LLMs generate output by predicting one token at a time. For each prediction, the model
          processes the full input through its attention layers to produce a probability
          distribution over possible next tokens. The model then samples from this distribution
          using parameters like temperature (which controls randomness) to select each token in
          sequence.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          Stability can act as an indirect measure of the model's confidence in its output, offering
          insights into the entropy in its predictions.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          Real-world applications that use LLMs rely on stable/consistent output. When stability is
          low, the output will be unpredictable, and sometimes unusable.
        </p>
        <div className="w-48 float-right grid grid-cols-1 gap-4 bg-gray-900 p-4 rounded-lg">
          <Select
            defaultValue={selectedModel}
            onValueChange={(value) => setSelectedModel(value as ModelName)}
          >
            <div className="text-sm ml-3">Model</div>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llama">Llama 3.1 (3B)</SelectItem>
              <SelectItem value="gpt4mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt4o">GPT-4o</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue={selectedStabilityOptionType}
            onValueChange={(value) => setSelectedStabilityOptionType(value as OptionType)}
          >
            <div className="text-sm ml-3">Option Type</div>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select option type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Numbered Options">Numbered Options</SelectItem>
              <SelectItem value="Lettered Options">Lettered Options</SelectItem>
              <SelectItem value="Bullet Points">Bullet Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex grid">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stabilityGraphData} layout="vertical" margin={{ left: 0, right: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  label={{ value: "Stability Score", position: "bottom", offset: 0 }}
                />
                <YAxis type="category" dataKey="questionName" width={180} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(0)}%`, "Stability"]} />
                <Legend verticalAlign="top" offset={10} />
                <Bar dataKey="order1" fill="#8884d8" name="Order 1" />
                <Bar dataKey="order2" fill="#82ca9d" name="Order 2" />
                <Bar dataKey="order3" fill="#ff7300" name="Order 3" />
                <Bar dataKey="order4" fill="#a4de6c" name="Order 4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4">Most Common Answers by Question</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="border border-gray-700 p-2 text-left">Question</th>
                    <th className="border border-gray-700 p-2 text-left">Order 1</th>
                    <th className="border border-gray-700 p-2 text-left">Order 2</th>
                    <th className="border border-gray-700 p-2 text-left">Order 3</th>
                    <th className="border border-gray-700 p-2 text-left">Order 4</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stabilityScores[selectedModel] || {}).map(
                    ([questionName, modelData]) => (
                      <tr key={questionName} className="border-b border-gray-700">
                        <td className="border border-gray-700 p-2">
                          {questionName.length > 30
                            ? questionName.substring(0, 30) + "..."
                            : questionName}
                        </td>
                        {[0, 1, 2, 3].map((order) => {
                          const mostCommonAnswer =
                            modelData[selectedStabilityOptionType]?.[order]?.mostCommonAnswer || "-"
                          const options = modelData[selectedStabilityOptionType]?.[order]?.options
                          const answerIndex = options?.indexOf(mostCommonAnswer)
                          return (
                            <td key={order} className="border border-gray-700 p-2">
                              {mostCommonAnswer || "-"} (Option {answerIndex})
                            </td>
                          )
                        })}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 text-xl font-bold mt-10">Results</p>
        <p className="text-muted-foreground mb-6">
          As expected, we see some variable stability based on the model and option type.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          Notably, the first option order has a higher stability score than the other orders, and is
          the most common answer overall. This reflects the fact that early tokens are weighted more
          heavily. When answers are biased by ordering, the first option is often the most common.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          gpt-4o-mini is dramatically more stable than other models. This is possibly unexpected,
          because it's a smaller model than gpt-4o. However, in my personal experience -mini is
          extremely good at producing stable responses, and follow instructions better than most
          other models.
        </p>
        <p className="text-muted-foreground mb-6 italic">
          All models really like The Shawshank Redemption, which is fair - it's a great movie.
        </p>
      </div>

      <div className="">
        <h2 className="text-2xl font-bold mb-4">Consistency</h2>
        <div className="w-48 float-right grid grid-cols-1 gap-4 bg-gray-900 p-4 rounded-lg">
          <Select
            defaultValue={selectedConsistencyOptionType}
            onValueChange={(value) => setSelectedConsistencyOptionType(value as OptionType)}
          >
            <div className="text-sm ml-3">Option Type</div>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Numbered Options">Numbered Options</SelectItem>
              <SelectItem value="Lettered Options">Lettered Options</SelectItem>
              <SelectItem value="Bullet Points">Bullet Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-muted-foreground mb-6 w-2/3">
          As we rotate the order of the options, the LLM may weigh one option more heavily than
          others, resulting in inconsistent results. Here we show the consistency of the LLM's
          responses across different option types (numbered, lettered, bulleted). Select the option
          type to view results.
        </p>

        <p className="text-muted-foreground mb-6 w-2/3 italic">
          The consistency score is the percentage of times the most common answer is the same across
          all option orderings.
        </p>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consistencyGraphData} layout="vertical" margin={{ right: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                label={{ value: "Consistency Score (%)", position: "bottom", offset: 0 }}
              />
              <YAxis type="category" dataKey="questionName" width={180} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Consistency"]} />
              <Legend verticalAlign="top" offset={10} />
              <Bar dataKey="gpt4o" fill="#8884d8" name="GPT-4o" />
              <Bar dataKey="gpt4mini" fill="#82ca9d" name="GPT-4o Mini" />
              <Bar dataKey="llama" fill="#ff7300" name="Llama 3.2 (3B)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Accuracy</h2>

        <p className="text-muted-foreground mb-6">
          For the two questions with a specific correct answer (Largest Planet and AI Term), the
          models had 100% consistency, and gave the correct answer 100% of the time. More than
          anything else, this shows how incredible the performance of these models is, even the
          smaller Llama 3B.
        </p>

        <p className="text-muted-foreground mb-6">
          These are simple questions, and it's likely that model training data included the correct
          answers. In real-world applications, it's very likely that the correct answer would be
          affected by the order of the options. Relying on in-built knowledge of the models is not a
          reliable way to get correct answers.
        </p>

        <p className="text-muted-foreground mb-6 italic">
          Accuracy in real-world applications is highly dependent on the context included in the
          prompt, including the instructions and examples given to the model. Rigorous evaluation of
          different prompts and models is required to ensure reliable results. Additionally, tools
          like{" "}
          <a className="underline" href="https://github.com/stanfordnlp/dspy">
            DSPy
          </a>{" "}
          can help optimize prompting.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Further Work</h2>

        <p className="text-muted-foreground mb-6">
          For the sake of time, mitigation of order dependency was not a focus of this project, nor
          was varying things like temperature, context size, etc.
        </p>

        <p className="text-muted-foreground mb-6">
          Multiple choice questions are very simple problems for modern LLMs. Real-world
          applications need to consider many more factors, like choosing data to fit into context,
          mitigating hallucinations, and prompt optimization. I'd love to have the opportunity to
          explore these challenges with you.
        </p>
      </div>
    </div>
  )
}
