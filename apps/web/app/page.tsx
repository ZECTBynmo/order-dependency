import { BarChart2 } from "lucide-react"
import Image, { type ImageProps } from "next/image"
import { Button } from "@repo/ui/button"

type Props = Omit<ImageProps, "src"> & {
  srcLight: string
  srcDark: string
}

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props

  return (
    <>
      <Image {...rest} src={srcLight} className="block dark:hidden" />
      <Image {...rest} src={srcDark} className="hidden dark:block" />
    </>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-8">
            <ThemeImage
              className="w-24 h-24 transition-transform hover:scale-105"
              srcLight="llm-order-deps.svg"
              srcDark="llm-order-deps-dark.svg"
              alt="LLM Order Dependencies logo"
              width={96}
              height={96}
              priority
            />
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            The Order Dependency Problem
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            The early token gets the worm
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="/analysis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full 
                       bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium
                       hover:translate-y-[-2px] transition-all hover:shadow-lg"
            >
              <BarChart2 size={20} />
              <span>Analysis</span>
            </a>

            <a
              href="/questions"
              className="inline-flex items-center px-6 py-3 rounded-full
                       border border-gray-200 dark:border-gray-700
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       font-medium transition-all hover:translate-y-[-2px]"
            >
              See the questions
            </a>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-gray-200 dark:border-gray-800">
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Made with <span className="mx-1">❤️</span> by Mike Vegeto
        </a>
      </footer>
    </div>
  )
}
