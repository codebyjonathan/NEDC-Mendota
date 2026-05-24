import type { AnonymousIdentity } from "./types"

const FIRST_WORDS = [
  "Calm",
  "Bright",
  "Gentle",
  "Silent",
  "Peaceful",
  "Serene",
  "Quiet",
  "Soft",
  "Still",
  "Warm",
  "Wise",
  "Hope",
  "Dream",
  "Star",
  "Leaf",
  "Wave",
  "River",
  "Cloud",
  "Rain",
  "Dawn",
  "Dusk",
  "Moon",
  "Sun",
  "Wind",
  "Sky",
  "Stone",
  "Bloom",
  "Tree",
  "Light",
  "Breath",
]

const SECOND_WORDS = [
  "River",
  "Leaf",
  "Meadow",
  "Ocean",
  "Forest",
  "Stone",
  "Peak",
  "Grove",
  "Haven",
  "Path",
  "Stream",
  "Valley",
  "Bay",
  "Cliff",
  "Glade",
  "Moss",
  "Fern",
  "Root",
  "Branch",
  "Bloom",
  "Petal",
  "Sage",
  "Birch",
  "Cedar",
  "Willow",
  "Aspen",
  "Pine",
  "Oak",
  "Maple",
  "Elm",
]

export function generateAnonymousUsername(): string {
  const firstWord = FIRST_WORDS[Math.floor(Math.random() * FIRST_WORDS.length)]
  const secondWord = SECOND_WORDS[Math.floor(Math.random() * SECOND_WORDS.length)]
  const number = Math.floor(Math.random() * 100)

  return `${firstWord}${secondWord}${number}`
}

export function generateAvatarSeed(userId: string): string {
  return `avatar_${userId}_${Date.now()}`
}

export function createAnonymousIdentity(): AnonymousIdentity {
  const id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    username: generateAnonymousUsername(),
    avatar_seed: generateAvatarSeed(id),
    created_at: new Date().toISOString(),
  }
}

export const SAFE_COMMUNITIES = [
  {
    id: "stress-anxiety",
    name: "Stress & Anxiety",
    slug: "stress-anxiety",
    description: "A space to talk about stress, anxious thoughts, and overwhelm",
    icon: "\u{1F61F}",
    color: "bg-gradient-to-br from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    accentColor: "text-blue-600",
    buttonColor: "bg-blue-600 hover:bg-blue-500",
  },
  {
    id: "school-pressure",
    name: "School Pressure",
    slug: "school-pressure",
    description: "Dealing with academic stress, pressure, and school challenges",
    icon: "\u{1F4DA}",
    color: "bg-gradient-to-br from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    accentColor: "text-amber-600",
    buttonColor: "bg-amber-600 hover:bg-amber-500",
  },
  {
    id: "sleep-struggles",
    name: "Sleep & Rest",
    slug: "sleep-struggles",
    description: "Talking about sleep difficulties, insomnia, and rest struggles",
    icon: "\u{1F634}",
    color: "bg-gradient-to-br from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
    accentColor: "text-indigo-600",
    buttonColor: "bg-indigo-600 hover:bg-indigo-500",
  },
  {
    id: "grief-loss",
    name: "Grief & Loss",
    slug: "grief-loss",
    description: "Supporting each other through loss, grief, and difficult changes",
    icon: "\u{1F499}",
    color: "bg-gradient-to-br from-slate-50 to-gray-50",
    borderColor: "border-slate-200",
    accentColor: "text-slate-600",
    buttonColor: "bg-slate-600 hover:bg-slate-500",
  },
  {
    id: "motivation-burnout",
    name: "Motivation & Burnout",
    slug: "motivation-burnout",
    description: "Dealing with lack of motivation, burnout, and loss of interest",
    icon: "\u{26A1}",
    color: "bg-gradient-to-br from-yellow-50 to-lime-50",
    borderColor: "border-yellow-200",
    accentColor: "text-yellow-600",
    buttonColor: "bg-yellow-600 hover:bg-yellow-500",
  },
  {
    id: "relationships",
    name: "Relationships & Belonging",
    slug: "relationships",
    description: "Navigating friendships, relationships, and feeling included",
    icon: "\u{1F91D}",
    color: "bg-gradient-to-br from-pink-50 to-rose-50",
    borderColor: "border-pink-200",
    accentColor: "text-pink-600",
    buttonColor: "bg-pink-600 hover:bg-pink-500",
  },
]

export function getCommunityById(communityId: string) {
  return SAFE_COMMUNITIES.find((c) => c.id === communityId)
}

export function getLocalizedCommunityContent(
  communityId: string,
  lang: "en" | "es" | "ar",
): { name: string; description: string } | null {
  const content: Record<string, { es: { name: string; description: string }; ar: { name: string; description: string } }> = {
    "stress-anxiety": {
      es: {
        name: "Estrés y Ansiedad",
        description: "Un espacio para hablar sobre estrés, pensamientos ansiosos y agobio",
      },
      ar: {
        name: "التوتر والقلق",
        description: "مساحة للحديث عن التوتر والأفكار القلقة والشعور بالإرهاق",
      },
    },
    "school-pressure": {
      es: {
        name: "Presión Escolar",
        description: "Para tratar el estrés académico, la presión y los desafíos escolares",
      },
      ar: {
        name: "ضغط الدراسة",
        description: "للتعامل مع التوتر الأكاديمي والضغط وتحديات المدرسة",
      },
    },
    "sleep-struggles": {
      es: {
        name: "Sueño y Descanso",
        description: "Hablar sobre dificultades para dormir, insomnio y problemas de descanso",
      },
      ar: {
        name: "النوم والراحة",
        description: "للحديث عن صعوبات النوم والأرق ومشاكل الراحة",
      },
    },
    "grief-loss": {
      es: {
        name: "Duelo y Pérdida",
        description: "Apoyarnos mutuamente ante pérdidas, duelo y cambios difíciles",
      },
      ar: {
        name: "الحزن والفقدان",
        description: "دعم بعضنا خلال الفقدان والحزن والتغيرات الصعبة",
      },
    },
    "motivation-burnout": {
      es: {
        name: "Motivación y Agotamiento",
        description: "Para afrontar la falta de motivación, el agotamiento y la pérdida de interés",
      },
      ar: {
        name: "الدافعية والاحتراق",
        description: "للتعامل مع قلة الدافعية والاحتراق وفقدان الاهتمام",
      },
    },
    relationships: {
      es: {
        name: "Relaciones y Pertenencia",
        description: "Navegar amistades, relaciones y el sentimiento de inclusión",
      },
      ar: {
        name: "العلاقات والانتماء",
        description: "لفهم الصداقات والعلاقات والشعور بالانتماء",
      },
    },
  }

  if (lang === "en") {
    const base = getCommunityById(communityId)
    return base ? { name: base.name, description: base.description } : null
  }

  const localized = content[communityId]?.[lang]
  if (!localized) {
    const base = getCommunityById(communityId)
    return base ? { name: base.name, description: base.description } : null
  }
  return localized
}

export const EMOTIONAL_REACTIONS = [
  {
    type: "heard",
    label: "You're Heard",
    emoji: "\u{1F442}",
    description: "I see you and your feelings matter",
  },
  {
    type: "strong",
    label: "Stay Strong",
    emoji: "\u{1F4AA}",
    description: "You're stronger than you think",
  },
  {
    type: "relate",
    label: "I Relate",
    emoji: "\u{1F91D}",
    description: "You're not alone in this",
  },
  {
    type: "support",
    label: "You've Got This",
    emoji: "\u{2728}",
    description: "I'm here supporting you",
  },
  {
    type: "hope",
    label: "There's Hope",
    emoji: "\u{1F31F}",
    description: "Things can get better",
  },
]

export function getReactionDetails(type: string) {
  return EMOTIONAL_REACTIONS.find((r) => r.type === type)
}
