import OpenAI from "openai"

let client: OpenAI | undefined

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY")
    client = new OpenAI({ apiKey })
  }

  return client
}

export const runtime = "nodejs"
export const maxDuration = 30

const SAFETY_PLAN_PROMPT = `
You are a supportive mental health assistant who helps users create
a simple and realistic safety plan. Provide calm, short suggestions.
Avoid medical advice. Ask gentle questions when needed.
`

const FALLBACK_RESPONSE =
  "I am here with you. Try one next step: 1) name one person to contact, 2) pick one calming activity for 10 minutes, 3) remove one immediate trigger from your space."

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ text: "No messages received." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ text: FALLBACK_RESPONSE, fallback: true, reason: "missing_api_key" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const openai = getClient()
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: SAFETY_PLAN_PROMPT }, ...messages],
      max_tokens: 220,
    })

    const aiMessage = response.choices?.[0]?.message?.content ?? FALLBACK_RESPONSE

    return new Response(JSON.stringify({ text: aiMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Safety Chat API error:", err)
    return new Response(
      JSON.stringify({
        text: FALLBACK_RESPONSE,
        fallback: true,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      route: "/api/safety-chat",
      hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}
