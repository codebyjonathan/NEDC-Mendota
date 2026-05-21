"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import { BadgeCheck, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  JOURNEY_STAGES,
  SOLAR_PLANETS,
  claimNextSolarMission,
  consumeFinalCelebration,
  consumeLegendaryCelebration,
  getMissionCounter,
  getMissionsRequiredForNextPlanet,
  getNextClaimPlanet,
  getNextStageMission,
  getSolarProgressState,
  getUnlockedPlanetCount,
  isNextMissionClaimable,
  subscribeToSolarProgress,
  type JourneyStage,
  type SolarProgressState,
  type SolarGoalId,
  type StageMission,
} from "@/lib/solar-system-goals"
import type { Language } from "@/lib/translations"

const JOURNEY_TRANSLATIONS = {
  en: {
    title: "Daily Journey",
    completePercent: "complete",
    subtitle: "Complete the Universe & Achieve Badges Interacting with the App!",
    start: "Start",
    complete: "Complete",
    current: "Current",
    next: "Next",
    launchPad: "Launch Pad",
    solarSystemMaster: "Solar System Master",
    claimingMission: "Claiming mission...",
    claimMissionReach: "Claim Mission: Reach",
    missionInProgress: "Mission in progress",
    allJourneyStagesCompleted: "All journey stages completed.",
    journeyBadges: "Journey badges",
    noSolarBadgesYet: "No solar badges yet.",
    galaxyBadges: "Galaxy badges",
    relic: "Relic",
    completeSolarToUnlockGalaxy: "Complete the solar system to unlock galaxy badges.",
    universeExplorer: "Universe Explorer",
    legendaryCosmicBadge: "Legendary Cosmic Badge",
    congratulations: "Congratulations!",
    reachedAndUnlockedGalaxy: "You reached {name} and unlocked a Galaxy Relic badge.",
    reachedAndUnlockedBadge: "You reached {name} and unlocked a new badge.",
    newGalaxyBadgeUnlocked: "New galaxy badge unlocked",
    newBadgeUnlocked: "New badge unlocked",
    keepExploring: "Keep Exploring",
    solarSystemComplete: "Solar System Complete",
    completedAllPlanets: "You completed all 8 planets and fused every planet badge into one special achievement.",
    solarSystemMasterBadge: "Solar System Master Badge",
    awesome: "Awesome",
    legendaryCosmicBadgeUnlocked: "Legendary Cosmic Badge Unlocked",
    fullScreenCelebration: "Full-screen celebration with a star-drop intro and all badges merging into the rarest badge.",
    completedEveryWorld: "You completed every world and galaxy. All badges merged into the rarest one.",
    claimLegendaryBadge: "Claim Legendary Badge",
  },
  es: {
    title: "Viaje Diario",
    completePercent: "completado",
    subtitle: "Completa el Universo y consigue insignias interactuando con la app.",
    start: "Inicio",
    complete: "Completado",
    current: "Actual",
    next: "Siguiente",
    launchPad: "Plataforma de lanzamiento",
    solarSystemMaster: "Maestro del Sistema Solar",
    claimingMission: "Reclamando misión...",
    claimMissionReach: "Reclamar misión: Llegar a",
    missionInProgress: "Misión en progreso",
    allJourneyStagesCompleted: "Todas las etapas del viaje completadas.",
    journeyBadges: "Insignias del viaje",
    noSolarBadgesYet: "Aún no hay insignias solares.",
    galaxyBadges: "Insignias de galaxia",
    relic: "Reliquia",
    completeSolarToUnlockGalaxy: "Completa el sistema solar para desbloquear insignias de galaxia.",
    universeExplorer: "Explorador del Universo",
    legendaryCosmicBadge: "Insignia Cósmica Legendaria",
    congratulations: "¡Felicidades!",
    reachedAndUnlockedGalaxy: "Llegaste a {name} y desbloqueaste una insignia reliquia de galaxia.",
    reachedAndUnlockedBadge: "Llegaste a {name} y desbloqueaste una nueva insignia.",
    newGalaxyBadgeUnlocked: "Nueva insignia de galaxia desbloqueada",
    newBadgeUnlocked: "Nueva insignia desbloqueada",
    keepExploring: "Seguir explorando",
    solarSystemComplete: "Sistema Solar Completado",
    completedAllPlanets: "Completaste los 8 planetas y fusionaste todas las insignias planetarias en un logro especial.",
    solarSystemMasterBadge: "Insignia Maestro del Sistema Solar",
    awesome: "Excelente",
    legendaryCosmicBadgeUnlocked: "Insignia Cósmica Legendaria Desbloqueada",
    fullScreenCelebration: "Celebración a pantalla completa con caída de estrella y fusión de todas las insignias en la más rara.",
    completedEveryWorld: "Completaste todos los mundos y galaxias. Todas las insignias se fusionaron en la más rara.",
    claimLegendaryBadge: "Reclamar Insignia Legendaria",
  },
  ar: {
    title: "الرحلة اليومية",
    completePercent: "مكتمل",
    subtitle: "أكمل الكون واحصل على الشارات من خلال التفاعل مع التطبيق.",
    start: "البداية",
    complete: "مكتمل",
    current: "الحالي",
    next: "التالي",
    launchPad: "منصة الإطلاق",
    solarSystemMaster: "سيد النظام الشمسي",
    claimingMission: "جارٍ استلام المهمة...",
    claimMissionReach: "استلام المهمة: الوصول إلى",
    missionInProgress: "المهمة قيد التنفيذ",
    allJourneyStagesCompleted: "اكتملت جميع مراحل الرحلة.",
    journeyBadges: "شارات الرحلة",
    noSolarBadgesYet: "لا توجد شارات شمسية بعد.",
    galaxyBadges: "شارات المجرة",
    relic: "أثر",
    completeSolarToUnlockGalaxy: "أكمل النظام الشمسي لفتح شارات المجرة.",
    universeExplorer: "مستكشف الكون",
    legendaryCosmicBadge: "الشارة الكونية الأسطورية",
    congratulations: "تهانينا!",
    reachedAndUnlockedGalaxy: "لقد وصلت إلى {name} وفتحت شارة أثر مجرية.",
    reachedAndUnlockedBadge: "لقد وصلت إلى {name} وفتحت شارة جديدة.",
    newGalaxyBadgeUnlocked: "تم فتح شارة مجرية جديدة",
    newBadgeUnlocked: "تم فتح شارة جديدة",
    keepExploring: "واصل الاستكشاف",
    solarSystemComplete: "اكتمل النظام الشمسي",
    completedAllPlanets: "لقد أكملت جميع الكواكب الثمانية ودمجت كل شارات الكواكب في إنجاز خاص.",
    solarSystemMasterBadge: "شارة سيد النظام الشمسي",
    awesome: "رائع",
    legendaryCosmicBadgeUnlocked: "تم فتح الشارة الكونية الأسطورية",
    fullScreenCelebration: "احتفال بملء الشاشة مع هبوط نجمي واندماج كل الشارات في الأندر.",
    completedEveryWorld: "لقد أكملت كل العوالم والمجرات. اندمجت كل الشارات في الأندر.",
    claimLegendaryBadge: "استلام الشارة الأسطورية",
  },
} as const

const PLANET_STAGE_NAMES: Record<Language, Record<string, string>> = {
  en: {
    mercury: "Mercury",
    venus: "Venus",
    earth: "Earth",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune",
    andromeda: "Andromeda",
    triangulum: "Triangulum",
    whirlpool: "Whirlpool",
    sombrero: "Sombrero",
    cartwheel: "Cartwheel",
  },
  es: {
    mercury: "Mercurio",
    venus: "Venus",
    earth: "Tierra",
    mars: "Marte",
    jupiter: "Júpiter",
    saturn: "Saturno",
    uranus: "Urano",
    neptune: "Neptuno",
    andromeda: "Andrómeda",
    triangulum: "Triángulo",
    whirlpool: "Remolino",
    sombrero: "Sombrero",
    cartwheel: "Rueda de Carro",
  },
  ar: {
    mercury: "عطارد",
    venus: "الزهرة",
    earth: "الأرض",
    mars: "المريخ",
    jupiter: "المشتري",
    saturn: "زحل",
    uranus: "أورانوس",
    neptune: "نبتون",
    andromeda: "أندروميدا",
    triangulum: "المثلث",
    whirlpool: "الدوامة",
    sombrero: "سومبريرو",
    cartwheel: "عجلة العربة",
  },
}

const GOAL_LABELS_BY_LANG: Record<Language, Record<SolarGoalId, string>> = {
  en: {
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
  },
  es: {
    visit_music_screen: "Abre la pantalla de Música",
    visit_journal_screen: "Abre la pantalla de Diario",
    visit_breathing_screen: "Abre la pantalla de Respiración",
    visit_grounding_screen: "Abre la pantalla de Enraizamiento",
    visit_resources_screen: "Abre la pantalla de Recursos",
    visit_safety_plan_screen: "Abre la pantalla del Plan de Seguridad",
    visit_chat_support_screen: "Abre la pantalla de Apoyo por Chat",
    visit_lifeline_screen: "Abre una pantalla de apoyo Lifeline",
    play_music: "Reproduce música integrada",
    play_music_url: "Reproduce música desde URL",
    save_journal: "Guarda una entrada del diario",
    start_breathing: "Inicia una sesión de respiración",
    complete_grounding: "Completa el ejercicio de enraizamiento",
    open_resource_link: "Abre un enlace de recursos",
    save_safety_plan: "Guarda tu plan de seguridad",
    open_chat_support: "Abre apoyo por chat",
    browse_lifeline_options: "Explora páginas de apoyo Lifeline",
  },
  ar: {
    visit_music_screen: "افتح شاشة الموسيقى",
    visit_journal_screen: "افتح شاشة اليوميات",
    visit_breathing_screen: "افتح شاشة التنفس",
    visit_grounding_screen: "افتح شاشة التأريض",
    visit_resources_screen: "افتح شاشة الموارد",
    visit_safety_plan_screen: "افتح شاشة خطة الأمان",
    visit_chat_support_screen: "افتح شاشة دعم الدردشة",
    visit_lifeline_screen: "افتح شاشة دعم Lifeline",
    play_music: "شغّل الموسيقى المدمجة",
    play_music_url: "شغّل الموسيقى من رابط URL",
    save_journal: "احفظ إدخالًا في اليوميات",
    start_breathing: "ابدأ جلسة تنفس",
    complete_grounding: "أكمل تمرين التأريض",
    open_resource_link: "افتح رابط موارد",
    save_safety_plan: "احفظ خطة الأمان الخاصة بك",
    open_chat_support: "افتح دعم الدردشة",
    browse_lifeline_options: "تصفح صفحات دعم Lifeline",
  },
}

const MISSION_COPY_BY_STAGE: Record<Language, Record<string, { title: string; description: string }>> = {
  en: {
    mercury: { title: "Navigation Step 1", description: "Guide mission: open the Music screen." },
    venus: { title: "Navigation Step 2", description: "Guide mission: open the Journal screen." },
    earth: { title: "Navigation Step 3", description: "Guide mission: open the Breathing screen." },
    mars: { title: "Navigation Step 4", description: "Guide mission: open the Grounding screen." },
    jupiter: { title: "Navigation Step 5", description: "Guide mission: open the Resources screen." },
    saturn: { title: "Navigation Step 6", description: "Guide mission: open the Safety Plan screen." },
    uranus: { title: "Navigation Step 7", description: "Guide mission: open the Chat Support screen." },
    neptune: { title: "Navigation Step 8", description: "Guide mission: open any Lifeline support screen." },
    andromeda: { title: "Galaxy Tier I", description: "Start navigation + interaction training with two missions." },
    triangulum: { title: "Galaxy Tier II", description: "Three-mission path with more app interaction." },
    whirlpool: { title: "Galaxy Tier III", description: "Four missions with specific tool usage." },
    sombrero: { title: "Galaxy Tier IV", description: "Five-mission advanced challenge." },
    cartwheel: { title: "Galaxy Tier V", description: "Final five-mission run before legendary completion." },
  },
  es: {
    mercury: { title: "Paso de Navegación 1", description: "Misión guiada: abre la pantalla de Música." },
    venus: { title: "Paso de Navegación 2", description: "Misión guiada: abre la pantalla de Diario." },
    earth: { title: "Paso de Navegación 3", description: "Misión guiada: abre la pantalla de Respiración." },
    mars: { title: "Paso de Navegación 4", description: "Misión guiada: abre la pantalla de Enraizamiento." },
    jupiter: { title: "Paso de Navegación 5", description: "Misión guiada: abre la pantalla de Recursos." },
    saturn: { title: "Paso de Navegación 6", description: "Misión guiada: abre la pantalla del Plan de Seguridad." },
    uranus: { title: "Paso de Navegación 7", description: "Misión guiada: abre la pantalla de Apoyo por Chat." },
    neptune: { title: "Paso de Navegación 8", description: "Misión guiada: abre cualquier pantalla de apoyo Lifeline." },
    andromeda: { title: "Nivel Galáctico I", description: "Inicia entrenamiento de navegación e interacción con dos misiones." },
    triangulum: { title: "Nivel Galáctico II", description: "Ruta de tres misiones con más interacción en la app." },
    whirlpool: { title: "Nivel Galáctico III", description: "Cuatro misiones con uso específico de herramientas." },
    sombrero: { title: "Nivel Galáctico IV", description: "Desafío avanzado de cinco misiones." },
    cartwheel: { title: "Nivel Galáctico V", description: "Carrera final de cinco misiones antes de la final legendaria." },
  },
  ar: {
    mercury: { title: "خطوة التنقل 1", description: "مهمة إرشادية: افتح شاشة الموسيقى." },
    venus: { title: "خطوة التنقل 2", description: "مهمة إرشادية: افتح شاشة اليوميات." },
    earth: { title: "خطوة التنقل 3", description: "مهمة إرشادية: افتح شاشة التنفس." },
    mars: { title: "خطوة التنقل 4", description: "مهمة إرشادية: افتح شاشة التأريض." },
    jupiter: { title: "خطوة التنقل 5", description: "مهمة إرشادية: افتح شاشة الموارد." },
    saturn: { title: "خطوة التنقل 6", description: "مهمة إرشادية: افتح شاشة خطة الأمان." },
    uranus: { title: "خطوة التنقل 7", description: "مهمة إرشادية: افتح شاشة دعم الدردشة." },
    neptune: { title: "خطوة التنقل 8", description: "مهمة إرشادية: افتح أي شاشة دعم Lifeline." },
    andromeda: { title: "المستوى المجرّي I", description: "ابدأ تدريب التنقل والتفاعل بمهمتين." },
    triangulum: { title: "المستوى المجرّي II", description: "مسار من ثلاث مهام مع تفاعل أكبر داخل التطبيق." },
    whirlpool: { title: "المستوى المجرّي III", description: "أربع مهام مع استخدام محدد للأدوات." },
    sombrero: { title: "المستوى المجرّي IV", description: "تحدٍ متقدم من خمس مهام." },
    cartwheel: { title: "المستوى المجرّي V", description: "الجولة النهائية من خمس مهام قبل الاكتمال الأسطوري." },
  },
}

export function SolarSystemJourney({ className = "", lang = "en" }: { className?: string; lang?: Language }) {
  const t = JOURNEY_TRANSLATIONS[lang]
  const [progressState, setProgressState] = useState<SolarProgressState>({
    completedGoals: [],
    claimedGoals: [],
    missionCounter: 0,
    totalMissionActions: 0,
    stageProgress: {},
    finalShown: false,
    legendaryShown: false,
    updatedAt: new Date(0).toISOString(),
  })
  const [planetCelebration, setPlanetCelebration] = useState<JourneyStage | null>(null)
  const [showFinalCelebration, setShowFinalCelebration] = useState(false)
  const [pendingFinalCelebration, setPendingFinalCelebration] = useState(false)
  const [showLegendaryCelebration, setShowLegendaryCelebration] = useState(false)
  const [pendingLegendaryCelebration, setPendingLegendaryCelebration] = useState(false)
  const [claimAnimating, setClaimAnimating] = useState(false)
  const arrivalPingTimeoutRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    setProgressState(getSolarProgressState())
    return subscribeToSolarProgress(() => {
      setProgressState(getSolarProgressState())
    })
  }, [])

  useEffect(() => {
    return () => {
      if (arrivalPingTimeoutRef.current !== null) {
        window.clearTimeout(arrivalPingTimeoutRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined)
        audioContextRef.current = null
      }
    }
  }, [])

  const unlockedCount = getUnlockedPlanetCount(progressState)
  const nextPlanet = getNextClaimPlanet(progressState)
  const nextMission = getNextStageMission(progressState)
  const claimReady = isNextMissionClaimable(progressState)
  const missionRequired = nextPlanet ? getMissionsRequiredForNextPlanet(progressState) : 0
  const missionProgress = nextPlanet ? Math.min(getMissionCounter(progressState), missionRequired) : 0
  const totalStages = JOURNEY_STAGES.length
  const completionPercent = useMemo(() => Math.round((unlockedCount / totalStages) * 100), [unlockedCount, totalStages])
  const currentPlanet = unlockedCount > 0 ? JOURNEY_STAGES[Math.min(unlockedCount, totalStages) - 1] : null
  const claimedSolarBadges = progressState.claimedGoals
    .map((stageId) => JOURNEY_STAGES.find((item) => item.id === stageId))
    .filter((stage): stage is JourneyStage => Boolean(stage && stage.category === "planet"))
  const claimedGalaxyBadges = progressState.claimedGoals
    .map((stageId) => JOURNEY_STAGES.find((item) => item.id === stageId))
    .filter((stage): stage is JourneyStage => Boolean(stage && stage.category === "galaxy"))

  const localizeStageName = (stage: JourneyStage | null) => {
    if (!stage) return ""
    return PLANET_STAGE_NAMES[lang][stage.id] ?? stage.name
  }

  const localizeMission = (mission: StageMission | null) => {
    if (!mission) return null
    const copy = MISSION_COPY_BY_STAGE[lang][mission.stageId]
    return {
      title: copy?.title ?? mission.title,
      description: copy?.description ?? mission.description,
      tasks: mission.tasks.map((task) => ({
        ...task,
        label: GOAL_LABELS_BY_LANG[lang][task.goalId] ?? task.label,
      })),
    }
  }

  const localizedMission = localizeMission(nextMission)

  useEffect(() => {
    if (showLegendaryCelebration || planetCelebration) return
    if (unlockedCount < JOURNEY_STAGES.length) return
    if (progressState.legendaryShown) return
    if (consumeLegendaryCelebration()) {
      setShowLegendaryCelebration(true)
      setProgressState(getSolarProgressState())
    }
  }, [showLegendaryCelebration, planetCelebration, unlockedCount, progressState.legendaryShown])

  const handleClaimMission = () => {
    if (!claimReady || claimAnimating) return
    setClaimAnimating(true)
    playTravelSound()

    window.setTimeout(() => {
      const result = claimNextSolarMission()
      const latestState = getSolarProgressState()
      setProgressState(latestState)
      setClaimAnimating(false)
      if (result.planet) setPlanetCelebration(result.planet)
      const claimedCount = getUnlockedPlanetCount(latestState)
      if (claimedCount >= JOURNEY_STAGES.length) {
        setPendingLegendaryCelebration(true)
      } else if (result.justCompletedFinal) {
        setPendingFinalCelebration(true)
      }
    }, 1400)
  }

  const playTravelSound = () => {
    try {
      const launch = new Audio("/rocket_whoosh.wav")
      launch.volume = 0.38
      void launch.play()
    } catch {
      // Ignore audio failures silently to avoid blocking interaction.
    }

    try {
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextCtor) return
      const context = audioContextRef.current && audioContextRef.current.state !== "closed"
        ? audioContextRef.current
        : new AudioContextCtor()
      audioContextRef.current = context

      const now = context.currentTime
      const master = context.createGain()
      master.gain.setValueAtTime(0.0001, now)
      master.gain.exponentialRampToValueAtTime(0.13, now + 0.22)
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.36)
      master.connect(context.destination)

      const osc = context.createOscillator()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(124, now)
      osc.frequency.exponentialRampToValueAtTime(82, now + 1.25)

      const filter = context.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(680, now)
      filter.frequency.exponentialRampToValueAtTime(220, now + 1.25)
      filter.Q.value = 0.7

      osc.connect(filter)
      filter.connect(master)
      osc.start(now)
      osc.stop(now + 1.32)

      if (arrivalPingTimeoutRef.current !== null) {
        window.clearTimeout(arrivalPingTimeoutRef.current)
      }
      arrivalPingTimeoutRef.current = window.setTimeout(() => {
        try {
          const pingTime = context.currentTime
          const pingOsc = context.createOscillator()
          const pingGain = context.createGain()
          pingOsc.type = "sine"
          pingOsc.frequency.setValueAtTime(740, pingTime)
          pingOsc.frequency.exponentialRampToValueAtTime(440, pingTime + 0.18)
          pingGain.gain.setValueAtTime(0.0001, pingTime)
          pingGain.gain.exponentialRampToValueAtTime(0.085, pingTime + 0.03)
          pingGain.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.22)
          pingOsc.connect(pingGain)
          pingGain.connect(context.destination)
          pingOsc.start(pingTime)
          pingOsc.stop(pingTime + 0.24)
        } catch {
          // no-op
        }
      }, 1160)
    } catch {
      // no-op
    }
  }

  const handleClosePlanetCelebration = () => {
    setPlanetCelebration(null)
    if (pendingLegendaryCelebration) {
      setPendingLegendaryCelebration(false)
      if (consumeLegendaryCelebration()) {
        setShowLegendaryCelebration(true)
      }
      return
    }
    if (!pendingFinalCelebration) return
    setPendingFinalCelebration(false)
    if (consumeFinalCelebration()) {
      setShowFinalCelebration(true)
    }
  }

  return (
    <>
      <section
        className={`overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-[#0f1736] via-[#1d2d6d] to-[#2f4ea1] p-5 text-white shadow-lg ${className}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">{t.title}</h3>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {completionPercent}% {t.completePercent}
          </span>
        </div>

        <p className="mb-3 text-sm text-blue-100">
          {t.subtitle}
        </p>

        <div className="rounded-2xl bg-black/15 p-3">
          <div className="relative h-24">
            <div className="solar-space-base absolute inset-0 rounded-xl" aria-hidden="true">
              <span className="solar-space-star solar-space-star-1" />
              <span className="solar-space-star solar-space-star-2" />
              <span className="solar-space-star solar-space-star-3" />
              <span className="solar-space-star solar-space-star-4" />
              <span className="solar-space-star solar-space-star-5" />
            </div>
            {claimAnimating && <div className="solar-space-condense absolute inset-0 rounded-xl" aria-hidden="true" />}
            {claimAnimating && (
              <div className="absolute inset-0 rounded-xl" aria-hidden="true">
                <span className="solar-space-streak solar-space-streak-1" />
                <span className="solar-space-streak solar-space-streak-2" />
                <span className="solar-space-streak solar-space-streak-3" />
              </div>
            )}
            <div className="absolute left-10 right-10 top-10 h-1 rounded-full bg-white/20" />
            <div className="absolute left-10 right-10 top-10 h-1 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-orange-300 opacity-70" />

            <div className="absolute left-1 top-0 text-center">
              {currentPlanet ? (
                <Image
                  src={currentPlanet.image}
                  alt={localizeStageName(currentPlanet)}
                  width={30}
                  height={30}
                  className="solar-planet-bob mx-auto h-8 w-8 rounded-full border border-white object-cover shadow-md"
                />
              ) : (
                <div className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/10">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
              )}
              <p className="mt-1 text-[10px] font-semibold text-white/95">{currentPlanet ? localizeStageName(currentPlanet) : t.start}</p>
            </div>

            <div className="absolute inset-x-0 top-0">
              <div
                className={`solar-rocket-combo absolute top-0 transition-[left] duration-[1400ms] ${
                  claimAnimating ? "solar-rocket-claiming" : ""
                }`}
                style={{ left: claimAnimating ? "calc(100% - 5.25rem)" : "2.15rem" }}
              >
                <div className="solar-rocket-glow relative">
                  <span className="solar-rocket-trail-mini" aria-hidden="true" />
                  <Image
                    src="/horizontal_rocket.png"
                    alt="Rocket progress"
                    width={84}
                    height={42}
                    className="solar-rocket-engine h-10 w-20 object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>

            <div className="absolute right-1 top-0 text-center">
              {nextPlanet ? (
                <>
                  <Image
                    src={nextPlanet.image}
                    alt={localizeStageName(nextPlanet)}
                    width={30}
                    height={30}
                    className="solar-planet-bob mx-auto h-8 w-8 rounded-full border border-white object-cover shadow-md"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-white/95">{localizeStageName(nextPlanet)}</p>
                </>
              ) : (
                <>
                  <Image
                    src="/planets/milky-way.svg"
                    alt="Complete"
                    width={30}
                    height={30}
                    className="solar-planet-bob mx-auto h-8 w-8 rounded-full border border-yellow-200 object-cover shadow-md"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-yellow-100">{t.complete}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 p-2.5">
              <span className="font-semibold text-blue-100">{t.current}:</span>{" "}
              {currentPlanet ? localizeStageName(currentPlanet) : t.launchPad}
            </div>
            <div className="rounded-xl bg-white/10 p-2.5">
              <span className="font-semibold text-blue-100">{t.next}:</span>{" "}
              {nextPlanet ? localizeStageName(nextPlanet) : t.solarSystemMaster}
            </div>
          </div>
        </div>

        {nextPlanet && (
          <button
            onClick={handleClaimMission}
            disabled={!claimReady || claimAnimating}
            className={`mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
              claimReady
                ? "bg-emerald-500 text-white shadow hover:bg-emerald-600"
                : "bg-white/10 text-blue-100"
            }`}
          >
            {claimAnimating
              ? t.claimingMission
              : claimReady
                ? `${t.claimMissionReach} ${localizeStageName(nextPlanet)}!`
                : `${t.missionInProgress}: ${missionProgress}/${missionRequired}`}
          </button>
        )}

        <div className="mt-2 rounded-2xl bg-white/10 p-3 text-sm">
          {nextPlanet && localizedMission ? (
            <div className="space-y-2">
              <p className="font-semibold text-white">{localizedMission.title}</p>
              <p className="text-blue-100">{localizedMission.description}</p>
              <div className="space-y-1.5">
                {localizedMission.tasks.map((task) => {
                  const currentCount = Math.min(progressState.stageProgress?.[task.goalId] ?? 0, task.count)
                  const done = currentCount >= task.count
                  return (
                    <div key={`${localizedMission.title}-${task.goalId}-${task.count}`} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5 text-xs">
                      <span className={done ? "text-emerald-200" : "text-blue-50"}>{task.label}</span>
                      <span className={`font-semibold ${done ? "text-emerald-200" : "text-blue-100"}`}>
                        {currentCount}/{task.count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 font-semibold text-emerald-200">
              <Rocket className="h-4 w-4" />
              {t.allJourneyStagesCompleted}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">{t.journeyBadges}</p>
          <div className="flex flex-wrap gap-2">
            {claimedSolarBadges.map((stage) => (
              <span key={stage.id} className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold">
                <Image src={stage.image} alt={localizeStageName(stage)} width={14} height={14} className="h-3.5 w-3.5 rounded-full" />
                {localizeStageName(stage)}
              </span>
            ))}
            {claimedSolarBadges.length === 0 && <span className="text-xs text-blue-100">{t.noSolarBadgesYet}</span>}
            {unlockedCount >= SOLAR_PLANETS.length && (
              <span className="solar-final-badge inline-flex items-center gap-1 rounded-full border border-yellow-200/70 bg-yellow-100/20 px-2.5 py-1 text-xs font-bold text-yellow-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t.solarSystemMaster}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-2.5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-cyan-100">{t.galaxyBadges}</p>
            <div className="flex flex-wrap gap-2">
              {claimedGalaxyBadges.map((stage) => (
                <span key={stage.id} className="inline-flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-100/15 px-2.5 py-1 text-xs font-bold text-cyan-100 shadow-[0_0_12px_rgba(125,211,252,0.25)]">
                  <Image src={stage.image} alt={localizeStageName(stage)} width={14} height={14} className="h-3.5 w-3.5 rounded-full ring-1 ring-cyan-200/70" />
                  {localizeStageName(stage)} {t.relic}
                </span>
              ))}
              {claimedGalaxyBadges.length === 0 && <span className="text-xs text-cyan-100/85">{t.completeSolarToUnlockGalaxy}</span>}
            {claimedGalaxyBadges.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-100/20 px-2.5 py-1 text-xs font-bold text-cyan-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t.universeExplorer}
              </span>
            )}
            {unlockedCount >= JOURNEY_STAGES.length && (
              <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-200/80 bg-fuchsia-100/20 px-2.5 py-1 text-xs font-black text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.35)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t.legendaryCosmicBadge}
              </span>
            )}
          </div>
        </div>
        </div>
      </section>

      <Dialog open={Boolean(planetCelebration)} onOpenChange={(open) => !open && handleClosePlanetCelebration()}>
        <DialogContent className="max-w-md rounded-3xl border-0 bg-gradient-to-b from-[#11204b] to-[#2b4b96] p-0 text-white">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{t.congratulations}</DialogTitle>
              <DialogDescription className="text-blue-100">
                {planetCelebration?.category === "galaxy"
                  ? t.reachedAndUnlockedGalaxy.replace("{name}", localizeStageName(planetCelebration))
                  : t.reachedAndUnlockedBadge.replace("{name}", localizeStageName(planetCelebration))}
              </DialogDescription>
            </DialogHeader>
            {planetCelebration && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <Image src={planetCelebration.image} alt={localizeStageName(planetCelebration)} width={56} height={56} className="solar-celebrate-pop h-14 w-14 rounded-full border-2 border-white shadow-md" />
                <div>
                  <p className="text-sm text-blue-100">
                    {planetCelebration.category === "galaxy" ? t.newGalaxyBadgeUnlocked : t.newBadgeUnlocked}
                  </p>
                  <p className="text-lg font-bold">{localizeStageName(planetCelebration)}</p>
                </div>
              </div>
            )}
            <Button onClick={handleClosePlanetCelebration} className="mt-6 w-full rounded-2xl bg-white text-[#1d2d6d] hover:bg-blue-50">
              {t.keepExploring}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalCelebration} onOpenChange={(open) => !open && setShowFinalCelebration(false)}>
        <DialogContent className="max-w-md rounded-3xl border-0 bg-gradient-to-b from-[#200f4d] via-[#3c2086] to-[#5d2ab8] p-0 text-white">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{t.solarSystemComplete}</DialogTitle>
              <DialogDescription className="text-purple-100">
                {t.completedAllPlanets}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 rounded-2xl bg-white/10 p-4 text-center">
              <div className="solar-final-scene mx-auto mb-3">
                {SOLAR_PLANETS.map((planet, index) => (
                  <div
                    key={`final-${planet.id}`}
                    className="solar-final-planet"
                    style={
                      {
                        ["--planet-index" as string]: index,
                        ["--planet-color" as string]: planet.color,
                      } as CSSProperties
                    }
                  >
                    <Image
                      src={planet.image}
                      alt={PLANET_STAGE_NAMES[lang][planet.id] ?? planet.name}
                      width={26}
                      height={26}
                      className="h-6 w-6 rounded-full border border-white/70 object-cover"
                    />
                  </div>
                ))}
                <div className="solar-badge-fusion solar-final-core mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-200/20">
                  <Image
                    src="/planets/milky-way.svg"
                    alt="Milky Way badge"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <p className="font-bold text-yellow-100">{t.solarSystemMasterBadge}</p>
            </div>
            <Button onClick={() => setShowFinalCelebration(false)} className="mt-6 w-full rounded-2xl bg-white text-[#3a237d] hover:bg-purple-50">
              {t.awesome}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLegendaryCelebration} onOpenChange={(open) => !open && setShowLegendaryCelebration(false)}>
        <DialogContent className="legendary-overlay fixed inset-0 max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-[#040714] p-0 text-white">
          <DialogHeader className="sr-only">
            <DialogTitle>{t.legendaryCosmicBadgeUnlocked}</DialogTitle>
            <DialogDescription>
              {t.fullScreenCelebration}
            </DialogDescription>
          </DialogHeader>
          <div className="legendary-scene">
            <div className="legendary-stars" aria-hidden="true">
              <span className="legendary-star legendary-star-1" />
              <span className="legendary-star legendary-star-2" />
              <span className="legendary-star legendary-star-3" />
              <span className="legendary-star legendary-star-4" />
              <span className="legendary-star legendary-star-5" />
              <span className="legendary-star legendary-star-6" />
            </div>

            <div className="legendary-star-drop" aria-hidden="true">
              <span className="legendary-star-drop-core" />
              <span className="legendary-star-drop-tail" />
            </div>

            <div className="legendary-badges" aria-hidden="true">
              {JOURNEY_STAGES.map((stage, index) => (
                <div key={`legendary-${stage.id}`} className="legendary-badge" style={{ ["--badge-index" as string]: index } as CSSProperties}>
                  <Image src={stage.image} alt={localizeStageName(stage)} width={26} height={26} className="h-6 w-6 rounded-full border border-white/70 object-cover" />
                </div>
              ))}
            </div>

            <div className="legendary-core">
              <Image src="/planets/milky-way.svg" alt="Legendary badge" width={120} height={120} className="h-28 w-28 rounded-full object-cover shadow-[0_0_40px_rgba(244,114,182,0.55)]" />
            </div>

            <div className="legendary-copy">
              <h2 className="text-3xl font-black tracking-tight">{t.legendaryCosmicBadgeUnlocked}</h2>
              <p className="mt-2 text-sm text-fuchsia-100">
                {t.completedEveryWorld}
              </p>
              <Button onClick={() => setShowLegendaryCelebration(false)} className="mt-5 rounded-2xl bg-white px-6 text-[#3b155f] hover:bg-fuchsia-50">
                {t.claimLegendaryBadge}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
