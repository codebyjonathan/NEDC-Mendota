import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

const SAFETY_PLAN_PROMPT = `… your full prompt …`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await client.chat.completions.create({
      model: "gpt-5-mini", 
      messages: [{ role: "system", content: SAFETY_PLAN_PROMPT }, ...messages],
      max_tokens: 1000,
    });

    return new Response(JSON.stringify({ text: response.choices[0].message.content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Safety chat API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
