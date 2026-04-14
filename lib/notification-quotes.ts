const MOTIVATIONAL_QUOTES = [
  "You have made it through every hard day so far.",
  "Take this moment one breath at a time.",
  "Small steps still count as progress.",
  "Rest is part of healing, not a pause from it.",
  "You deserve the same kindness you give others.",
  "It is okay to slow down and care for yourself today.",
  "Even a gentle check-in with yourself can make a difference.",
  "You are allowed to ask for support and take up space.",
  "Your feelings are real, and they are allowed to be here.",
  "A calmer moment can start with one intentional pause.",
]

export function getRandomMotivationalQuote(previousQuote?: string): string {
  if (MOTIVATIONAL_QUOTES.length === 1) {
    return MOTIVATIONAL_QUOTES[0]
  }

  let nextQuote = previousQuote || ""

  while (nextQuote === previousQuote) {
    nextQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  }

  return nextQuote
}
