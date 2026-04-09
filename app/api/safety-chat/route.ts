import OpenAI from "openai";

let client: OpenAI | undefined;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const maxDuration = 30;

const SAFETY_PLAN_PROMPT = `
You are a supportive mental health assistant who helps users create
a simple and realistic safety plan. Provide calm, short suggestions.
Avoid medical advice. Ask gentle questions when needed.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ text: "No messages received." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = getClient();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // safer test model
      messages: [
        { role: "system", content: SAFETY_PLAN_PROMPT },
        ...messages,
      ],
      max_completion_tokens: 200,
    });

    console.log("OpenAI response:", response); // ← check in terminal

    const aiMessage = response.choices?.[0]?.message?.content ?? "No response from AI.";

    return new Response(
      JSON.stringify({ text: aiMessage }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Safety Chat API error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Optional test route
export async function GET() {
  const openai = getClient();
  const testResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a friendly assistant." },
      { role: "user", content: "Say hello" },
    ],
  });
  console.log("API test response:", testResponse);
  return new Response(JSON.stringify({ text: testResponse.choices[0].message.content }), {
    headers: { "Content-Type": "application/json" },
  });
}
