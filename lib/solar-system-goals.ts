export type SolarGoalId =
  | "visit_music_screen"
  | "visit_journal_screen"
  | "visit_breathing_screen"
  | "visit_grounding_screen"
  | "visit_resources_screen"
  | "visit_safety_plan_screen"
  | "visit_chat_support_screen"
  | "visit_lifeline_screen"
  | "play_music"
  | "play_music_url"
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

export type GalaxyStageId = "andromeda" | "triangulum" | "whirlpool" | "sombrero" | "cartwheel"

export type SolarPlanet = {
  id: SolarPlanetId
  name: string
  color: string
  image: string
  goalId: SolarGoalId
  goalLabel: string
}

export type JourneyStage = {
  id: string
  name: string
  color: string
  image: string
  category: "planet" | "galaxy"
}

export type MissionTask = {
  goalId: SolarGoalId
  label: string
  count: number
}

export type StageMission = {
  stageId: string
  title: string
  description: string
  tasks: MissionTask[]
}

export type SolarProgressState = {
  completedGoals: SolarGoalId[]
  claimedGoals: string[]
  missionCounter: number
  totalMissionActions: number
  stageProgress: Partial<Record<SolarGoalId, number>>
  finalShown: boolean
  legendaryShown: boolean
  updatedAt: string
}

const STORAGE_KEY = "solarJourneyProgressV1"
const EVENT_NAME = "solar-journey-updated"

const GOAL_LABELS: Record<SolarGoalId, string> = {
  visit_music_screen: "Open the Music screen",
  visit_journal_screen: "Open the Journal screen",
  visit_breathing_screen: "Open the Breathing screen",
  visit_grounding_screen: "Open the Grounding screen",
  visit_resources_screen: "Open the Resources screen",
  visit_safety_plan_screen: "Open the Safety Plan screen",
  visit_chat_support_screen: "Open the Chat Support screen",
  visit_lifeline_screen: "Open a Lifeline support screen",
  play_music: "Play built-in music",
  play_music_url: "Play music from URL",
  save_journal: "Save a journal entry",
  start_breathing: "Start a breathing session",
  complete_grounding: "Complete grounding exercise",
  open_resource_link: "Open a resources link",
  save_safety_plan: "Save your safety plan",
  open_chat_support: "Open chat support",
  browse_lifeline_options: "Browse lifeline support pages",
}

const ALL_GOALS: SolarGoalId[] = Object.keys(GOAL_LABELS) as SolarGoalId[]

export const SOLAR_PLANETS: SolarPlanet[] = [
  { id: "mercury", name: "Mercury", color: "#A9A9A9", image: "/planets/mercury.svg", goalId: "visit_music_screen", goalLabel: GOAL_LABELS.visit_music_screen },
  { id: "venus", name: "Venus", color: "#D8B384", image: "/planets/venus.svg", goalId: "visit_journal_screen", goalLabel: GOAL_LABELS.visit_journal_screen },
  { id: "earth", name: "Earth", color: "#4FA3FF", image: "/planets/earth.svg", goalId: "visit_breathing_screen", goalLabel: GOAL_LABELS.visit_breathing_screen },
  { id: "mars", name: "Mars", color: "#D26B42", image: "/planets/mars.svg", goalId: "visit_grounding_screen", goalLabel: GOAL_LABELS.visit_grounding_screen },
  { id: "jupiter", name: "Jupiter", color: "#D5A26D", image: "/planets/jupiter.svg", goalId: "visit_resources_screen", goalLabel: GOAL_LABELS.visit_resources_screen },
  { id: "saturn", name: "Saturn", color: "#E4D2A4", image: "/planets/saturn.svg", goalId: "visit_safety_plan_screen", goalLabel: GOAL_LABELS.visit_safety_plan_screen },
  { id: "uranus", name: "Uranus", color: "#85D9E8", image: "/planets/uranus.svg", goalId: "visit_chat_support_screen", goalLabel: GOAL_LABELS.visit_chat_support_screen },
  { id: "neptune", name: "Neptune", color: "#5871E8", image: "/planets/neptune.svg", goalId: "visit_lifeline_screen", goalLabel: GOAL_LABELS.visit_lifeline_screen },
]

export const GALAXY_STAGES: Array<{ id: GalaxyStageId; name: string; color: string; image: string }> = [
  { id: "andromeda", name: "Andromeda", color: "#8e63ff", image: "/planets/andromeda.svg" },
  { id: "triangulum", name: "Triangulum", color: "#5fb3ff", image: "/planets/triangulum.svg" },
  { id: "whirlpool", name: "Whirlpool", color: "#9d7bff", image: "/planets/whirlpool.svg" },
  { id: "sombrero", name: "Sombrero", color: "#ffc979", image: "/planets/sombrero.svg" },
  { id: "cartwheel", name: "Cartwheel", color: "#7ed8ff", image: "/planets/cartwheel.svg" },
]

export const JOURNEY_STAGES: JourneyStage[] = [
  ...SOLAR_PLANETS.map((planet) => ({ id: planet.id, name: planet.name, color: planet.color, image: planet.image, category: "planet" as const })),
  ...GALAXY_STAGES.map((galaxy) => ({ id: galaxy.id, name: galaxy.name, color: galaxy.color, image: galaxy.image, category: "galaxy" as const })),
]

export const STAGE_MISSIONS: StageMission[] = [
  {
    stageId: "mercury",
    title: "Navigation Step 1",
    description: "Guide mission: open the Music screen.",
    tasks: [{ goalId: "visit_music_screen", label: GOAL_LABELS.visit_music_screen, count: 1 }],
  },
  {
    stageId: "venus",
    title: "Navigation Step 2",
    description: "Guide mission: open the Journal screen.",
    tasks: [{ goalId: "visit_journal_screen", label: GOAL_LABELS.visit_journal_screen, count: 1 }],
  },
  {
    stageId: "earth",
    title: "Navigation Step 3",
    description: "Guide mission: open the Breathing screen.",
    tasks: [{ goalId: "visit_breathing_screen", label: GOAL_LABELS.visit_breathing_screen, count: 1 }],
  },
  {
    stageId: "mars",
    title: "Navigation Step 4",
    description: "Guide mission: open the Grounding screen.",
    tasks: [{ goalId: "visit_grounding_screen", label: GOAL_LABELS.visit_grounding_screen, count: 1 }],
  },
  {
    stageId: "jupiter",
    title: "Navigation Step 5",
    description: "Guide mission: open the Resources screen.",
    tasks: [{ goalId: "visit_resources_screen", label: GOAL_LABELS.visit_resources_screen, count: 1 }],
  },
  {
    stageId: "saturn",
    title: "Navigation Step 6",
    description: "Guide mission: open the Safety Plan screen.",
    tasks: [{ goalId: "visit_safety_plan_screen", label: GOAL_LABELS.visit_safety_plan_screen, count: 1 }],
  },
  {
    stageId: "uranus",
    title: "Navigation Step 7",
    description: "Guide mission: open the Chat Support screen.",
    tasks: [{ goalId: "visit_chat_support_screen", label: GOAL_LABELS.visit_chat_support_screen, count: 1 }],
  },
  {
    stageId: "neptune",
    title: "Navigation Step 8",
    description: "Guide mission: open any Lifeline support screen.",
    tasks: [{ goalId: "visit_lifeline_screen", label: GOAL_LABELS.visit_lifeline_screen, count: 1 }],
  },
  {
    stageId: "andromeda",
    title: "Galaxy Tier I",
    description: "Start navigation + interaction training with two missions.",
    tasks: [
      { goalId: "visit_resources_screen", label: GOAL_LABELS.visit_resources_screen, count: 1 },
      { goalId: "play_music", label: GOAL_LABELS.play_music, count: 1 },
    ],
  },
  {
    stageId: "triangulum",
    title: "Galaxy Tier II",
    description: "Three-mission path with more app interaction.",
    tasks: [
      { goalId: "visit_chat_support_screen", label: GOAL_LABELS.visit_chat_support_screen, count: 1 },
      { goalId: "save_journal", label: GOAL_LABELS.save_journal, count: 1 },
      { goalId: "start_breathing", label: GOAL_LABELS.start_breathing, count: 1 },
    ],
  },
  {
    stageId: "whirlpool",
    title: "Galaxy Tier III",
    description: "Four missions with specific tool usage.",
    tasks: [
      { goalId: "visit_lifeline_screen", label: GOAL_LABELS.visit_lifeline_screen, count: 1 },
      { goalId: "play_music_url", label: GOAL_LABELS.play_music_url, count: 1 },
      { goalId: "open_resource_link", label: GOAL_LABELS.open_resource_link, count: 1 },
      { goalId: "save_journal", label: GOAL_LABELS.save_journal, count: 1 },
    ],
  },
  {
    stageId: "sombrero",
    title: "Galaxy Tier IV",
    description: "Five-mission advanced challenge.",
    tasks: [
      { goalId: "visit_safety_plan_screen", label: GOAL_LABELS.visit_safety_plan_screen, count: 1 },
      { goalId: "save_safety_plan", label: GOAL_LABELS.save_safety_plan, count: 1 },
      { goalId: "open_chat_support", label: GOAL_LABELS.open_chat_support, count: 1 },
      { goalId: "browse_lifeline_options", label: GOAL_LABELS.browse_lifeline_options, count: 1 },
      { goalId: "complete_grounding", label: GOAL_LABELS.complete_grounding, count: 1 },
    ],
  },
  {
    stageId: "cartwheel",
    title: "Galaxy Tier V",
    description: "Final five-mission run before legendary completion.",
    tasks: [
      { goalId: "visit_music_screen", label: GOAL_LABELS.visit_music_screen, count: 1 },
      { goalId: "play_music_url", label: GOAL_LABELS.play_music_url, count: 1 },
      { goalId: "save_journal", label: GOAL_LABELS.save_journal, count: 1 },
      { goalId: "open_resource_link", label: GOAL_LABELS.open_resource_link, count: 1 },
      { goalId: "save_safety_plan", label: GOAL_LABELS.save_safety_plan, count: 1 },
    ],
  },
]

const DEFAULT_STATE: SolarProgressState = {
  completedGoals: [],
  claimedGoals: [],
  missionCounter: 0,
  totalMissionActions: 0,
  stageProgress: {},
  finalShown: false,
  legendaryShown: false,
  updatedAt: new Date(0).toISOString(),
}

const STAGE_IDS = JOURNEY_STAGES.map((stage) => stage.id)

function isBrowser() {
  return typeof window !== "undefined"
}

function normalizeState(input: Partial<SolarProgressState> | null | undefined): SolarProgressState {
  const completedRaw = Array.isArray(input?.completedGoals) ? (input!.completedGoals as string[]) : []
  const claimedRaw = Array.isArray(input?.claimedGoals) ? input!.claimedGoals : []
  const legacyClaimedCount =
    typeof (input as { shownUnlockCount?: number } | undefined)?.shownUnlockCount === "number" &&
    Number.isFinite((input as { shownUnlockCount?: number }).shownUnlockCount)
      ? Math.max(0, Math.min((input as { shownUnlockCount?: number }).shownUnlockCount ?? 0, SOLAR_PLANETS.length))
      : 0

  const migratedCompleted = completedRaw.map((goal) => (goal === "start_emergency_call" ? "visit_lifeline_screen" : goal))
  const completed = migratedCompleted.filter((goal): goal is SolarGoalId => ALL_GOALS.includes(goal as SolarGoalId))

  const stageClaimed = claimedRaw.filter((id): id is string => typeof id === "string" && STAGE_IDS.includes(id))
  const legacyGoalClaimed = claimedRaw.filter((id): id is SolarGoalId => typeof id === "string" && ALL_GOALS.includes(id as SolarGoalId))
  const fromLegacyGoalLength = JOURNEY_STAGES.slice(0, legacyGoalClaimed.length).map((stage) => stage.id)
  const fromLegacyShown = JOURNEY_STAGES.slice(0, legacyClaimedCount).map((stage) => stage.id)
  const claimedGoals =
    stageClaimed.length > 0
      ? STAGE_IDS.filter((id) => stageClaimed.includes(id))
      : fromLegacyGoalLength.length > 0
        ? fromLegacyGoalLength
        : fromLegacyShown

  const stageProgress =
    input?.stageProgress && typeof input.stageProgress === "object"
      ? Object.fromEntries(
          Object.entries(input.stageProgress).filter(
            ([goalId, count]) =>
              ALL_GOALS.includes(goalId as SolarGoalId) &&
              typeof count === "number" &&
              Number.isFinite(count) &&
              count > 0,
          ),
        ) as Partial<Record<SolarGoalId, number>>
      : {}

  return {
    completedGoals: ALL_GOALS.filter((goal) => completed.includes(goal)),
    claimedGoals,
    missionCounter: typeof input?.missionCounter === "number" && Number.isFinite(input.missionCounter) ? Math.max(0, input.missionCounter) : 0,
    totalMissionActions:
      typeof input?.totalMissionActions === "number" && Number.isFinite(input.totalMissionActions)
        ? Math.max(0, input.totalMissionActions)
        : 0,
    stageProgress,
    finalShown: Boolean(input?.finalShown),
    legendaryShown: Boolean(input?.legendaryShown),
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
  const claimed = Array.isArray(state.claimedGoals) ? state.claimedGoals : []
  return Math.min(claimed.length, JOURNEY_STAGES.length)
}

export function getUnlockedPlanets(state: SolarProgressState) {
  const claimedCount = getUnlockedPlanetCount(state)
  return SOLAR_PLANETS.slice(0, Math.min(claimedCount, SOLAR_PLANETS.length))
}

export function getNextClaimPlanet(state: SolarProgressState): JourneyStage | null {
  const claimedCount = getUnlockedPlanetCount(state)
  return JOURNEY_STAGES[claimedCount] ?? null
}

export function getNextStageMission(state: SolarProgressState): StageMission | null {
  const nextStage = getNextClaimPlanet(state)
  if (!nextStage) return null
  return STAGE_MISSIONS.find((mission) => mission.stageId === nextStage.id) ?? null
}

export function getMissionsRequiredForNextPlanet(state: SolarProgressState) {
  const mission = getNextStageMission(state)
  if (!mission) return 0
  return mission.tasks.reduce((total, task) => total + task.count, 0)
}

export function getMissionCounter(state: SolarProgressState) {
  const stage = state.stageProgress ?? {}
  return Object.values(stage).reduce((total, value) => total + (typeof value === "number" ? value : 0), 0)
}

export function isNextMissionClaimable(state: SolarProgressState) {
  const mission = getNextStageMission(state)
  if (!mission) return false
  const stage = state.stageProgress ?? {}
  return mission.tasks.every((task) => (stage[task.goalId] ?? 0) >= task.count)
}

export function markSolarGoalCompleted(goalId: SolarGoalId) {
  const current = getSolarProgressState()
  const alreadyLogged = current.completedGoals.includes(goalId)
  const nextState: SolarProgressState = normalizeState({
    ...current,
    completedGoals: alreadyLogged ? current.completedGoals : [...current.completedGoals, goalId],
    missionCounter: (current.missionCounter ?? 0) + 1,
    totalMissionActions: (current.totalMissionActions ?? 0) + 1,
    stageProgress: {
      ...(current.stageProgress ?? {}),
      [goalId]: ((current.stageProgress ?? {})[goalId] ?? 0) + 1,
    },
    updatedAt: new Date().toISOString(),
  })
  saveState(nextState)
  return { changed: true, state: nextState, newlyUnlockedPlanet: null as JourneyStage | null, justCompletedFinal: false }
}

export function claimNextSolarMission() {
  const state = getSolarProgressState()
  const nextStage = getNextClaimPlanet(state)
  if (!nextStage) return { changed: false, planet: null as JourneyStage | null, state, justCompletedFinal: false }
  if (!isNextMissionClaimable(state)) {
    return { changed: false, planet: null as JourneyStage | null, state, justCompletedFinal: false }
  }
  if (state.claimedGoals.includes(nextStage.id)) {
    return { changed: false, planet: null as JourneyStage | null, state, justCompletedFinal: false }
  }

  const previousClaimed = getUnlockedPlanetCount(state)
  const nextState: SolarProgressState = normalizeState({
    ...state,
    claimedGoals: [...state.claimedGoals, nextStage.id],
    missionCounter: 0,
    stageProgress: {},
    updatedAt: new Date().toISOString(),
  })
  const nextClaimed = getUnlockedPlanetCount(nextState)
  const justCompletedFinal = previousClaimed < SOLAR_PLANETS.length && nextClaimed >= SOLAR_PLANETS.length
  saveState(nextState)
  return { changed: true, planet: nextStage, state: nextState, justCompletedFinal }
}

export function consumeFinalCelebration() {
  const state = getSolarProgressState()
  const unlockedCount = getUnlockedPlanetCount(state)
  if (unlockedCount < SOLAR_PLANETS.length || state.finalShown) return false
  const nextState = { ...state, finalShown: true, updatedAt: new Date().toISOString() }
  saveState(nextState)
  return true
}

export function consumeLegendaryCelebration() {
  const state = getSolarProgressState()
  const unlockedCount = getUnlockedPlanetCount(state)
  if (unlockedCount < JOURNEY_STAGES.length || state.legendaryShown) return false

  const nextState = {
    ...state,
    legendaryShown: true,
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
  saveState({
    completedGoals: [],
    claimedGoals: [],
    missionCounter: 0,
    totalMissionActions: 0,
    stageProgress: {},
    finalShown: false,
    legendaryShown: false,
    updatedAt: new Date().toISOString(),
  })
}
