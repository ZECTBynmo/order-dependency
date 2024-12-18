# Order Dependency Exploration

This is a simple application that shows some of the results from my exploration, while also flexing some app development skills. I'd use the same tech and a similar setup for a production app.

These days my favorite stack is instructor-js + zod for LLM interactions, bun + typescript + shadcn for apps, and prisma/drizzle + postgres for db.

## Dependencies

- Bun
- OpenAI API key
- OrbStack/Docker
- (optional) LM Studio for local Llama 3.2 3B

Note: Normally I would use vllm or similar to run models like llama, but I figured LM Studio was easier for this handoff.

## Setup

### Environment and services

Create a .env file with:

DATABASEURL=postgresql://prisma:prisma123@localhost:5432/deporder
OPENAI_API_KEY="sk-proj-your-api-key"

If testing against Llama, install LM Studio, download Llama 3.2 3B, and enable the server.

Run `docker-compose up` to start up the postgres container

### Installation

`bun install` in the main directory

## Populate the database

`bun run populate`
`bun run evaluate`

## Running the UI

`bun dev` in the main directory

# Where is the important stuff?

Interactions with LLMs happens in packages/ai

Order dependency mechanics happen in packages/order-dependency

Evaluation and insertion into postgres happens in apps/cli

# AI Tools

Instructor-js is my preferred way to interact with LLMs, an excellent tool written by a friend of mine (a typescript clone of python Instructor). It sets up a common interface to multiple LLMs, and allows you to define output schemas using zod.

The OpenAI npm package is used to interface with GPT as normal, and it's also used to interact with Llama by setting a custom baseUrl. Using this common client interface we can use the same instructor-js toolchain for all models.

# The Order Dependency Problem

The app UI shows the details of my full analysis. You can view it [here](https://order-dependency-web.vercel.app/) but briefly in the readme:

I created a set of 5 multiple choice questions. Some with clear correct answers, and some with ambiguous opinion-based answers. The problem is most likely to be visible with ambiguous questions, so it was important to have both types, and be able to show the difference.

I set a high temperature (0.9) to try to emphasize result variability. My hope was that if order bias raised the probabilities of non-correct answers, high temperature would cause them to be selected more. That may have worked for Llama, but didn't affect GPT results.

# Raw Data

I included a raw dump of the questions and answers in questions.csv and answers.csv
