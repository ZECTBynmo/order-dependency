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

Evaluation and insertion into postgres happens in app/cli

# AI Tools

Instructor-js is an excellent tool written by a friend of mine. It sets up a common interface to multiple LLMs, and allows you to clearly define output schemas using zod.
