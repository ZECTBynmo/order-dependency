"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnalysisChartsProps {
  correctAnswerByOptionIndex: {
    modelName: ModelName | "all"
    optionType: OptionType | "all"
    position: number
    totalCount: number
    correctCount: number
    positionPercentage: number
    correctAnswerPercentage: number
  }[]
}

type OptionType = "Numbered Options" | "Lettered Options" | "Bullet Points"

export function AnalysisCharts({ correctAnswerByOptionIndex }: AnalysisChartsProps) {
  const [selectedModel, setSelectedModel] = useState<ModelName | "all">("llama")
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType | "all">(
    "Numbered Options"
  )

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">The Order Dependency of LLMs</h2>
      </div>
      <div>
        <p className="mb-5">
          LLMs process inputs as sequences of tokens. Each token is passed through attention layers
          that calculate how it interacts with other tokens in the sequence, building up the overall
          context. Tokens are processed in parallel within a layer, but earlier tokens can sometimes
          have a greater influence on the model's outputs because of how positional encodings and
          attention mechanisms interpret the sequence. This can result in a subtle "primacy bias",
          where information presented earlier in a prompt may carry more weight in guiding the
          model's response.
        </p>
        <p className="mb-5">
          To explore this, we've asked several LLMs to answer{" "}
          <a className="underline" href="/questions">
            15 multiple choice questions
          </a>
          {". "}
          Each question has 4 options, and we asked them with 4 different orderings of the options.
        </p>
        <p className="mb-5">
          We also chose 3 different representations of the options in the prompt to show that
          accuracy is about token order, not option presentation.
        </p>
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
        <p className="mb-5">
          To get more statistical significance, we asked each question 3 times for each combination
          of variables. Amounting to a total of 1620 answers.
        </p>
        <p className="text-gray-400 italic">Let's dig into some data to learn more</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">What do we expect to see?</h2>
        <p className="text-muted-foreground mb-6">
          In short: we expect to see that the models are most accurate when the correct answer is in
          the first position.
        </p>

        <p className="text-muted-foreground mb-6">
          We may see some variance in accuracy based on the model and option type, but the correct
          answer should be in the first position most often.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Let's get into the data the Data</h2>

        <p className="text-muted-foreground mb-6">
          For the questions with a specific correct answer, we can see that the models got the right
          answer most often when the correct answer was in the first position. This is exactly what
          we expected:
        </p>

        <div className="h-[300px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={correctAnswerByOptionIndex.filter(
                (item) => item.modelName === "all" && item.optionType === "all"
              )}
              margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="position"
                label={{ value: "Correct Answer Position", position: "bottom", offset: 0 }}
              />
              <YAxis
                label={{ value: "% Correct", angle: -90, position: "insideLeft" }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)}%`}
                labelFormatter={(label) => `Position ${label + 1}`}
              />
              <Legend verticalAlign="top" offset={10} />
              <Bar dataKey="correctAnswerPercentage" name="Percent Correct" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-muted-foreground mb-6">
          Digging in further, we can examine the effects of different models and option prefixes.{" "}
          <i>
            <b>We see that our top-line results aren't the full story</b>
          </i>
          . There's a big difference between models.
        </p>

        <div className="flex flex-row gap-4">
          <div className="h-[400px] mb-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={correctAnswerByOptionIndex.filter(
                  (item) =>
                    item.modelName === selectedModel && item.optionType === selectedOptionType
                )}
                margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="position"
                  label={{ value: "Correct Answer Position", position: "bottom", offset: 0 }}
                />
                <YAxis
                  label={{ value: "% Correct", angle: -90, position: "insideLeft" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  labelFormatter={(label) => `Position ${label + 1}`}
                />
                <Legend verticalAlign="top" offset={10} />
                <Bar dataKey="correctAnswerPercentage" name="Percent Correct" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-4 mt-10 mr-5 w-48 bg-gray-900 p-4 rounded-lg">
              <Select
                defaultValue={selectedModel}
                onValueChange={(value) => setSelectedModel(value as ModelName | "all")}
              >
                <div className="text-sm ml-3">Model</div>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="llama">Llama 3.1 (3B)</SelectItem>
                  <SelectItem value="gpt4mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
              <Select
                defaultValue={selectedOptionType}
                onValueChange={(value) => setSelectedOptionType(value as OptionType | "all")}
              >
                <div className="text-sm ml-3">Option Type</div>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Numbered Options">Numbered Options</SelectItem>
                  <SelectItem value="Lettered Options">Lettered Options</SelectItem>
                  <SelectItem value="Bullet Points">Bullet Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Llama 3.1 has the most illustrative results, because it's the most affected by the option
          order. We see correct answers happen most often when the correct answer is in the first
          position, and least often when the correct answer is in the last position.
        </p>

        <p className="text-muted-foreground mb-6">
          Notably when we number the options, there's increased accuracy when the correct answer is
          in position 0 or 2. This speaks to an internal bias that may come from training data, or
          some other bias that's unclear - an opportunity for further exploration. Lettered options
          have a slightly different distribution, with more correct answers for options A and B.
        </p>

        <p className="text-muted-foreground mb-6">
          It's possible that prefixes like "A" or "1" affect the bias. Bulleted options are included
          because they're unordered. As expected, they have a very even descending distribution of
          accuracy, with the percentage decreasing as the correct answer is further down the list.
          This may suggest that unordered option prefixes are preferable, because although bias is
          still present, it's more predictable.
        </p>

        <p className="text-muted-foreground mb-6">
          However (maybe more interestingly), GPT-4o and GPT-4o Mini have 100% accuracy for all
          questions, no matter the order of options. This speaks to how incredible these models are,
          how good their training is, and how well they've been able to correct for ordering bias.
        </p>

        <p className="text-muted-foreground mb-6 italic">
          Multiple choice questions are very simple, and models are likely to be trained on these or
          similar questions. Real-world problems with less obvious answers are more likely to be
          affected by ordering bias.
        </p>

        <p className="text-muted-foreground mb-6 italic">
          Accuracy in real-world applications is highly dependent on the context included in the
          prompt, including the instructions and examples given to the model. Rigorous evaluation of
          different prompts and models is required to ensure reliable results. Many tools and
          techniques exist to evaluate prompts and results. Additionally, tools like{" "}
          <a className="underline" href="https://github.com/stanfordnlp/dspy">
            DSPy
          </a>{" "}
          can help optimize prompting.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Further Work</h2>

        <p className="text-muted-foreground mb-6">
          I explored the "stability" of the answers - how often the same answer as chosen for a
          given model + option prefix + opption order combination. Results were not especially
          interesting, and I didn't include them here for fear of muddying the waters.
        </p>

        <p className="text-muted-foreground mb-6">
          I also looked at the consistency of the answers - how often the same answer was chosen for
          a given question across option orders. This is similar to the accuracy results, except
          could be applied to any question, not just those with a specific correct answer. I again
          omitted them from this writeup.
        </p>

        <p className="text-muted-foreground mb-6">
          For the sake of time, mitigation of order dependency was not a focus of this project, nor
          was varying things like temperature, context size, etc.
        </p>

        <p className="text-muted-foreground mb-6">
          Real-world applications need to consider many more factors, like choosing what data to put
          into context, mitigating hallucinations, and prompt optimization.
        </p>

        <p className="text-muted-foreground mb-6 italic">I love this stuff.</p>
      </div>
    </div>
  )
}
