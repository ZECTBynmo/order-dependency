"use client"

import { motion } from "framer-motion"
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
import { type AccuracyByOptionIndex, type OpinionsByOptionIndex } from "@repo/db"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnalysisChartsProps {
  correctAnswerByOptionIndex: AccuracyByOptionIndex[]
  opinionData: OpinionsByOptionIndex[]
}

type OptionType = "Numbered Options" | "Lettered Options" | "Bullet Points"

export function AnalysisCharts({ correctAnswerByOptionIndex, opinionData }: AnalysisChartsProps) {
  const [selectedModel, setSelectedModel] = useState<ModelName | "all">("llama")
  const [selectedOptionType, setSelectedOptionType] = useState<OptionType | "all">(
    "Numbered Options"
  )

  const [selectedOpinionModel, setSelectedOpinionModel] = useState<ModelName | "all">("llama")
  const [selectedOpinionOptionType, setSelectedOpinionOptionType] = useState<OptionType | "all">(
    "all"
  )

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8">
      {/* Title Section */}
      <motion.div
        className="bg-gray-900/50 rounded-lg p-8 hover:bg-gray-900/60 transition-colors duration-300"
        {...fadeIn}
      >
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent hover:scale-[1.01] transition-transform duration-300">
          The Order Dependency of LLMs
        </h1>
        <p className="text-gray-300 leading-relaxed">
          LLMs process inputs as sequences of tokens. Each token is passed through attention layers
          that calculate how it interacts with other tokens in the sequence, building up the overall
          context. Tokens are processed in parallel within a layer, but earlier tokens can sometimes
          have a greater influence on the model's outputs because of how positional encodings and
          attention mechanisms interpret the sequence. This can result in a subtle "primacy bias",
          where information presented earlier in a prompt may carry more weight in guiding the
          model's response.
        </p>
      </motion.div>

      {/* Let's dig in section */}
      <motion.div
        className="bg-gray-900/50 rounded-lg p-8 hover:bg-gray-900/60 transition-colors duration-300"
        {...fadeIn}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Let's dig in</h2>
        <p className="text-gray-300 leading-relaxed mb-5">
          To explore this, we've asked Llama 3.1, GPT-4o Mini, and GPT-4o to answer{" "}
          <a className="underline" href="/questions">
            15 multiple choice questions
          </a>
          {". "}
          Each question has 4 options, and we asked them with 4 different orderings of the options.
        </p>
        <p className="text-gray-300 leading-relaxed mb-5">
          We also chose 3 different representations of the options in the prompt to show that
          accuracy is about token order, not option presentation.
        </p>
        <div className="space-y-2">
          <motion.div className="flex items-center space-x-2 hover:translate-x-1 transition-transform duration-300">
            <span className="font-semibold text-green-400">Numbered:</span>
            <span className="text-gray-300">
              1. Option 1, 2. Option 2, 3. Option 3, 4. Option 4
            </span>
          </motion.div>
          <motion.div className="flex items-center space-x-2 hover:translate-x-1 transition-transform duration-300">
            <span className="font-semibold text-green-400">Lettered:</span>
            <span className="text-gray-300">
              A. Option 1, B. Option 2, C. Option 3, D. Option 4
            </span>
          </motion.div>
          <motion.div className="flex items-center space-x-2 hover:translate-x-1 transition-transform duration-300">
            <span className="font-semibold text-green-400">Bulleted:</span>
            <span className="text-gray-300">- Option 1, - Option 4, - Option 3, - Option 2</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Expectations section */}
      <div className="bg-gray-900/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">What do we expect to see?</h2>
        <div className="space-y-4 text-gray-300">
          <p>In short: we expect to see a bias towards choosing the first option.</p>
          <p>
            For questions with a specific correct answer, we expect to see LLMs get the correct
            answer most often when the correct answer is in the first position. For opinion-based
            questions, we expect to see the LLM choose the first option most often.
          </p>
        </div>
      </div>

      <motion.div
        className="bg-gray-900/50 rounded-lg p-8 hover:bg-gray-900/60 transition-colors duration-300"
        {...fadeIn}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Fact-based Questions</h2>
        <p className="text-gray-300 mb-6">
          For the questions with a specific correct answer, we can see that the models got the right
          answer most often when the correct answer was in the first position. This is exactly what
          we expected:
        </p>

        {/* First chart */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4 mb-8 hover:bg-gray-800/60 transition-colors duration-300"
          transition={{ duration: 0.3 }}
        >
          <div className="h-[400px] w-full">
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
                  formatter={(value: string | number | (string | number)[]) =>
                    `${Number(value).toFixed(1)}%`
                  }
                  labelFormatter={(label) => `Position ${Number(label) + 1}`}
                />
                <Legend verticalAlign="top" />
                <Bar dataKey="correctAnswerPercentage" name="Percent Correct" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <p className="text-gray-300 mb-6">
          However, looking a bit deeper we see that{" "}
          <i>
            <b>that's not the full story</b>
          </i>
          . There's a big difference between models.
        </p>

        {/* Interactive chart section */}
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            className="bg-gray-800/50 rounded-lg p-4 flex-grow hover:bg-gray-800/60 transition-colors duration-300"
            transition={{ duration: 0.3 }}
          >
            <div className="h-[400px]">
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
                    formatter={(value: string | number | (string | number)[]) =>
                      `${Number(value).toFixed(1)}%`
                    }
                    labelFormatter={(label) => `Position ${Number(label) + 1}`}
                  />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="correctAnswerPercentage" name="Percent Correct" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 rounded-lg p-6 w-full md:w-64 hover:bg-gray-800/60 transition-colors duration-300"
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Model</label>
                <Select
                  defaultValue={selectedModel}
                  onValueChange={(value: string) => setSelectedModel(value as ModelName | "all")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="llama">Llama 3.1 (3B)</SelectItem>
                    <SelectItem value="gpt4mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt4o">GPT-4o</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Option Type</label>
                <Select
                  defaultValue={selectedOptionType}
                  onValueChange={(value: string) =>
                    setSelectedOptionType(value as OptionType | "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Numbered Options">Numbered Options</SelectItem>
                    <SelectItem value="Lettered Options">Lettered Options</SelectItem>
                    <SelectItem value="Bullet Points">Bullet Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis text */}
        <motion.div
          className="space-y-6 mt-8 text-gray-300"
          {...fadeIn}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>
            Llama 3.1 has the most illustrative results, because it's the most affected by the
            option order. We see correct answers happen most often when the correct answer is in the
            first position, and least often when the correct answer is in the last position.
          </p>
          <p>
            Notably when we number the options, there's increased accuracy when the correct answer
            is in position 0 or 2. This speaks to an internal bias that may come from training data,
            or some other bias that's unclear - an opportunity for further exploration. Lettered
            options have a slightly different distribution, with more correct answers for options A
            and B.
          </p>
          <p>
            It's possible that prefixes like "A" or "1" affect the bias. Bulleted options are
            included because they're unordered. As expected, they have a very even descending
            distribution of accuracy, with the percentage decreasing as the correct answer is
            further down the list. This may suggest that unordered option prefixes are preferable,
            because although bias is still present, it's more predictable.
          </p>
          <p>
            However (maybe more interestingly), GPT-4o and GPT-4o Mini have 100% accuracy for all
            questions, no matter the order of options. This speaks to how incredible these models
            are, how good their training is, and how well they've been able to correct for ordering
            bias.
          </p>
          <p className="italic font-medium text-green-400">
            Multiple choice questions are very simple, and models are likely to be trained on these
            or similar questions. Real-world problems with less obvious answers are more likely to
            be affected by ordering bias.
          </p>
          <p className="italic font-medium text-green-400">
            Accuracy in real-world applications is highly dependent on the context included in the
            prompt, including the instructions and examples given to the model. Rigorous evaluation
            of different prompts and models is required to ensure reliable results. Many tools and
            techniques exist to evaluate prompts and results. Additionally, tools like{" "}
            <a className="underline" href="https://github.com/stanfordnlp/dspy">
              DSPy
            </a>{" "}
            can help optimize prompting.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-gray-900/50 rounded-lg p-8 hover:bg-gray-900/60 transition-colors duration-300"
        {...fadeIn}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Opinion-based Questions</h2>
        <p className="text-gray-300 mb-6">
          These questions have less certain outputs, so they're more likely to be affected by order
          bias. Sure enough, we see that the first option is chosen far more often.
        </p>

        {/* First chart */}
        <motion.div
          className="bg-gray-800/50 rounded-lg p-4 mb-8 hover:bg-gray-800/60 transition-colors duration-300"
          transition={{ duration: 0.3 }}
        >
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={opinionData.filter(
                  (item) => item.modelName === "all" && item.optionType === "all"
                )}
                margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="optionPosition"
                  label={{ value: "Answer Position", position: "bottom", offset: 0 }}
                />
                <YAxis label={{ value: "Num Answers", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value: string | number | (string | number)[]) => `${Number(value)}`}
                  labelFormatter={(label) => `Position ${Number(label) + 1}`}
                />
                <Legend verticalAlign="top" />
                <Bar dataKey="matchCount" name="Answer Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Interactive chart section */}
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            className="bg-gray-800/50 rounded-lg p-4 flex-grow hover:bg-gray-800/60 transition-colors duration-300"
            transition={{ duration: 0.3 }}
          >
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={opinionData.filter(
                    (item) =>
                      item.modelName === selectedOpinionModel &&
                      item.optionType === selectedOpinionOptionType
                  )}
                  margin={{ top: 20, right: 30, left: 20, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="optionPosition"
                    label={{ value: "Answer Position", position: "bottom", offset: 0 }}
                  />
                  <YAxis label={{ value: "Num Answers", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value: string | number | (string | number)[]) => `${Number(value)}`}
                    labelFormatter={(label) => `Position ${Number(label) + 1}`}
                  />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="matchCount" name="Answer Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="bg-gray-800/50 rounded-lg p-6 w-full md:w-64 hover:bg-gray-800/60 transition-colors duration-300">
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Model</label>
                <Select
                  defaultValue={selectedOpinionModel}
                  onValueChange={(value: string) =>
                    setSelectedOpinionModel(value as ModelName | "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="llama">Llama 3.1 (3B)</SelectItem>
                    <SelectItem value="gpt4mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt4o">GPT-4o</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Option Type</label>
                <Select
                  defaultValue={selectedOpinionOptionType}
                  onValueChange={(value: string) =>
                    setSelectedOpinionOptionType(value as OptionType | "all")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Numbered Options">Numbered Options</SelectItem>
                    <SelectItem value="Lettered Options">Lettered Options</SelectItem>
                    <SelectItem value="Bullet Points">Bullet Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis text */}
        <motion.div
          className="space-y-6 mt-8 text-gray-300"
          {...fadeIn}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>
            Llama 3.1 again is the most affected by the option order, with the first option being
            chosen far more often.
          </p>
          <p>
            GPT-4o shows some preference for the first option, and then has a relatively even, lower
            distribution for later positions, although it's not descending as we might expect.
          </p>
          <p>
            4o-mini is interesting. Its distrubion is far flatter, and it always prefers the second
            option, or chooses it at the same rate as the first. This is an interesting result,
            maybe suggesting some training or intentional internal bias that's correcting for order
            bias.
          </p>
          <p>
            It's possible that GPT-4o Mini is being influenced by the relatively high temperature
            used in the generation of these questions, causing it to be more random, and therefore
            select the less-preferred option more often. Either way it's the least affected by order
            bias.
          </p>
          <p className="italic font-medium text-green-400">
            In my personal experience with real-world applications, GPT-4o Mini has extremely stable
            output. Maybe the same training and internal mechanics that make it so stable are also
            correcting (and possibly overcorrecting) for order bias.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-gray-900/50 rounded-lg p-8 hover:bg-gray-900/60 transition-colors duration-300"
        {...fadeIn}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Further Work</h2>
        <div className="space-y-6 text-gray-300">
          <p>
            I explored the "stability" of the answers - how often the same answer as chosen for a
            given model + option prefix + opption order combination. Results were not especially
            interesting, and I didn't include them here for fear of muddying the waters.
          </p>
          <p>
            I also looked at the consistency of the answers - how often the same answer was chosen
            for a given question across option orders. This is similar to the accuracy results,
            except could be applied to any question, not just those with a specific correct answer.
            I again omitted them from this writeup.
          </p>
          <p>
            GPT got my questions 100% correct, which I wasn't happy with. Doing some further
            reading, it's likely possible to generate questions that are calculably harder for LLMs
            to answer. See papers like{" "}
            <a className="underline" href="https://arxiv.org/pdf/2402.17916">
              this one
            </a>{" "}
            and{" "}
            <a className="underline" href="https://arxiv.org/pdf/2410.05229">
              this one
            </a>
            . I haven't dug into this yet.
          </p>
          <p>
            For the sake of time, mitigation of order dependency was not a focus of this project,
            nor was varying things like temperature, context size, etc.
          </p>
          <p>
            Real-world applications need to consider many more factors, like choosing what data to
            put into context, mitigating hallucinations, and prompt optimization.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
