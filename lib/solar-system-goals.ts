export type SolarGoalId =
  | "play_music"
  | "save_journal"
  | "start_breathing"
  | "complete_grounding"
  | "open_resource_link"
  | "save_safety_plan"
  | "open_chat_support"
  | "browse_lifeline_options"

export type SolarPlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"

export type SolarPlanet = {
  id: SolarPlanetId
  name: string
  color: string
  image: string
  goalId: SolarGoalId
  goalLabel: string
}

export type SolarProgressState = {
  completedGoals: SolarGoalId[]
  shownUnlockCount: number
  finalShown: boolean
  updatedAt: string
}

const STORAGE_KEY = "solarJourneyProgressV1"
const EVENT_NAME = "solar-journey-updated"

export const SOLAR_PLANETS: SolarPlanet[] = [
  { id: "mercury", name: "Mercury", color: "#A9A9A9", image: "/planets/mercury.svg", goalId: "play_music", goalLabel: "Play any music in the app" },
  { id: "venus", name: "Venus", color: "#D8B384", image: "/planets/venus.svg", goalId: "save_journal", goalLabel: "Save a journal entry" },
  { id: "earth", name: "Earth", color: "#4FA3FF", image: "/planets/earth.svg", goalId: "start_breathing", goalLabel: "Start a breathing session" },
  { id: "mars", name: "Mars", color: "#D26B42", image: "/planets/mars.svg", goalId: "complete_grounding", goalLabel: "Complete the grounding steps" },
  { id: "jupiter", name: "Jupiter", color: "#D5A26D", image: "/planets/jupiter.svg", goalId: "open_resource_link", goalLabel: "Open any resource link" },
  { id: "saturn", name: "Saturn", color: "#E4D2A4", image: "/planets/saturn.svg", goalId: "save_safety_plan", goalLabel: "Save your safety plan" },
  { id: "uranus", name: "Uranus", color: "#85D9E8", image: "/planets/uranus.svg", goalId: "open_chat_support", goalLabel: "Open a chat support service" },
  {
    id: "neptune",
    name: "Neptune",
    color: "#5871E8",
    image: "/planets/neptune.svg",
    goalId: "browse_lifeline_options",
    goalLabel: "Visit lifeline support pages (no call needed)",
  },
]

const DEFAULT_STATE: SolarProgressState = {
  completedGoals: [],
  shownUnlockCount: 0,
  finalShown: false,
  updatedAt: new Date(0).toISOString(),
}

const GOAL_ORDER = SOLAR_PLANETS.map((planet) => planet.goalId)

function isBrowser() {
  return typeof window !== "undefined"
}

function normalizeState(input: Partial<SolarProgressState> | null | undefined): SolarProgressState {
  const completedRaw = Array.isArray(input?.completedGoals) ? input!.completedGoals : []
  const migrated = completedRaw.map((goal) =>
    goal === "start_emergency_call" ? "browse_lifeline_options" : goal,
  )
  const completed = migrated.filter((goal): goal is SolarGoalId => GOAL_ORDER.includes(goal as SolarGoalId))
  const ordered = GOAL_ORDER.filter((goal) => completed.includes(goal))
  return {
    completedGoals: ordered,
    shownUnlockCount:
      typeof input?.shownUnlockCount === "number" && Number.isFinite(input.shownUnlockCount)
        ? Math.max(0, Math.min(input.shownUnlockCount, SOLAR_PLANETS.length))
        : 0,
    finalShown: Boolean(input?.finalShown),
    updatedAt: typeof input?.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
  }
}

function emitUpdate() {
  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function saveState(state: SolarProgressState) {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  emitUpdate()
}

export function getSolarProgressState(): SolarProgressState {
  if (!isBrowser()) return DEFAULT_STATE
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_STATE
  try {
    return normalizeState(JSON.parse(raw) as Partial<SolarProgressState>)
  } catch {
    return DEFAULT_STATE
  }
}

export function getUnlockedPlanetCount(state: SolarProgressState) {
  return Math.min(state.completedGoals.length, SOLAR_PLANETS.length)
}

export function getUnlockedPlanets(state: SolarProgressState) {
  return SOLAR_PLANETS.slice(0, getUnlockedPlanetCount(state))
}

export function getNextUnfinishedPlanet(state: SolarProgressState) {
  return SOLAR_PLANETS.find((planet) => !state.completedGoals.includes(planet.goalId))
}

export function markSolarGoalCompleted(goalId: SolarGoalId) {
  const current = getSolarProgressState()
  if (current.completedGoals.includes(goalId)) {
    return { changed: false, state: current, newlyUnlockedPlanet: null as SolarPlanet | null, justCompletedFinal: false }
  }

  const previousUnlocked = getUnlockedPlanetCount(current)
  const nextState: SolarProgressState = normalizeState({
    ...current,
    completedGoals: [...current.completedGoals, goalId],
    updatedAt: new Date().toISOString(),
  })
  const nextUnlocked = getUnlockedPlanetCount(nextState)
  const newlyUnlockedPlanet = nextUnlocked > previousUnlocked ? SOLAR_PLANETS[nextUnlocked - 1] : null
  const justCompletedFinal = previousUnlocked < SOLAR_PLANETS.length && nextUnlocked === SOLAR_PLANETS.length

  saveState(nextState)
  return { changed: true, state: nextState, newlyUnlockedPlanet, justCompletedFinal }
}

export function consumeNextPlanetCelebration(): SolarPlanet | null {
  const state = getSolarProgressState()
  const unlockedCount = getUnlockedPlanetCount(state)
  if (state.shownUnlockCount >= unlockedCount) return null

  const planet = SOLAR_PLANETS[state.shownUnlockCount] ?? null
  if (!planet) return null

  const nextState = {
    ...state,
    shownUnlockCount: state.shownUnlockCount + 1,
    updatedAt: new Date().toISOString(),
  }
  saveState(nextState)
  return planet
}

export function consumeFinalCelebration() {
  const state = getSolarProgressState()
  const unlockedCount = getUnlockedPlanetCount(state)
  if (unlockedCount < SOLAR_PLANETS.length || state.finalShown) return false

  const nextState = {
    ...state,
    finalShown: true,
    updatedAt: new Date().toISOString(),
  }
  saveState(nextState)
  return true
}

export function subscribeToSolarProgress(onChange: () => void) {
  if (!isBrowser()) return () => {}

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  const onCustom = () => onChange()

  window.addEventListener("storage", onStorage)
  window.addEventListener(EVENT_NAME, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(EVENT_NAME, onCustom)
  }
}

export function resetSolarProgress() {
  const nextState: SolarProgressState = {
    completedGoals: [],
    shownUnlockCount: 0,
    finalShown: false,
    updatedAt: new Date().toISOString(),
  }
  saveState(nextState)
}
