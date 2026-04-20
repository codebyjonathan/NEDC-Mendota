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
} from "@/lib/solar-system-goals"

export function SolarSystemJourney({ className = "" }: { className?: string }) {
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
          <h3 className="text-lg font-bold">Daily Journey</h3>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {completionPercent}% complete
          </span>
        </div>

        <p className="mb-3 text-sm text-blue-100">
          Complete the Universe &amp; Achieve Badges Interacting with the App!
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
                  alt={currentPlanet.name}
                  width={30}
                  height={30}
                  className="solar-planet-bob mx-auto h-8 w-8 rounded-full border border-white object-cover shadow-md"
                />
              ) : (
                <div className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/10">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
              )}
              <p className="mt-1 text-[10px] font-semibold text-white/95">{currentPlanet ? currentPlanet.name : "Start"}</p>
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
                    alt={nextPlanet.name}
                    width={30}
                    height={30}
                    className="solar-planet-bob mx-auto h-8 w-8 rounded-full border border-white object-cover shadow-md"
                  />
                  <p className="mt-1 text-[10px] font-semibold text-white/95">{nextPlanet.name}</p>
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
                  <p className="mt-1 text-[10px] font-semibold text-yellow-100">Complete</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 p-2.5">
              <span className="font-semibold text-blue-100">Current:</span>{" "}
              {currentPlanet ? currentPlanet.name : "Launch Pad"}
            </div>
            <div className="rounded-xl bg-white/10 p-2.5">
              <span className="font-semibold text-blue-100">Next:</span>{" "}
              {nextPlanet ? nextPlanet.name : "Solar System Master"}
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
              ? "Claiming mission..."
              : claimReady
                ? `Claim Mission: Reach ${nextPlanet.name}!`
                : `Mission in progress: ${missionProgress}/${missionRequired}`}
          </button>
        )}

        <div className="mt-2 rounded-2xl bg-white/10 p-3 text-sm">
          {nextPlanet && nextMission ? (
            <div className="space-y-2">
              <p className="font-semibold text-white">{nextMission.title}</p>
              <p className="text-blue-100">{nextMission.description}</p>
              <div className="space-y-1.5">
                {nextMission.tasks.map((task) => {
                  const currentCount = Math.min(progressState.stageProgress?.[task.goalId] ?? 0, task.count)
                  const done = currentCount >= task.count
                  return (
                    <div key={`${nextMission.stageId}-${task.goalId}-${task.count}`} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5 text-xs">
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
              All journey stages completed.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Journey badges</p>
          <div className="flex flex-wrap gap-2">
            {claimedSolarBadges.map((stage) => (
              <span key={stage.id} className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold">
                <Image src={stage.image} alt={stage.name} width={14} height={14} className="h-3.5 w-3.5 rounded-full" />
                {stage.name}
              </span>
            ))}
            {claimedSolarBadges.length === 0 && <span className="text-xs text-blue-100">No solar badges yet.</span>}
            {unlockedCount >= SOLAR_PLANETS.length && (
              <span className="solar-final-badge inline-flex items-center gap-1 rounded-full border border-yellow-200/70 bg-yellow-100/20 px-2.5 py-1 text-xs font-bold text-yellow-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                Solar System Master
              </span>
            )}
          </div>

          <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-2.5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-cyan-100">Galaxy badges</p>
            <div className="flex flex-wrap gap-2">
              {claimedGalaxyBadges.map((stage) => (
                <span key={stage.id} className="inline-flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-100/15 px-2.5 py-1 text-xs font-bold text-cyan-100 shadow-[0_0_12px_rgba(125,211,252,0.25)]">
                  <Image src={stage.image} alt={stage.name} width={14} height={14} className="h-3.5 w-3.5 rounded-full ring-1 ring-cyan-200/70" />
                  {stage.name} Relic
                </span>
              ))}
              {claimedGalaxyBadges.length === 0 && <span className="text-xs text-cyan-100/85">Complete the solar system to unlock galaxy badges.</span>}
            {claimedGalaxyBadges.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/70 bg-cyan-100/20 px-2.5 py-1 text-xs font-bold text-cyan-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                Universe Explorer
              </span>
            )}
            {unlockedCount >= JOURNEY_STAGES.length && (
              <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-200/80 bg-fuchsia-100/20 px-2.5 py-1 text-xs font-black text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.35)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Legendary Cosmic Badge
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
              <DialogTitle className="text-2xl font-bold">Congratulations!</DialogTitle>
              <DialogDescription className="text-blue-100">
                {planetCelebration?.category === "galaxy"
                  ? `You reached ${planetCelebration?.name} and unlocked a Galaxy Relic badge.`
                  : `You reached ${planetCelebration?.name} and unlocked a new badge.`}
              </DialogDescription>
            </DialogHeader>
            {planetCelebration && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <Image src={planetCelebration.image} alt={planetCelebration.name} width={56} height={56} className="solar-celebrate-pop h-14 w-14 rounded-full border-2 border-white shadow-md" />
                <div>
                  <p className="text-sm text-blue-100">
                    {planetCelebration.category === "galaxy" ? "New galaxy badge unlocked" : "New badge unlocked"}
                  </p>
                  <p className="text-lg font-bold">{planetCelebration.name}</p>
                </div>
              </div>
            )}
            <Button onClick={handleClosePlanetCelebration} className="mt-6 w-full rounded-2xl bg-white text-[#1d2d6d] hover:bg-blue-50">
              Keep Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalCelebration} onOpenChange={(open) => !open && setShowFinalCelebration(false)}>
        <DialogContent className="max-w-md rounded-3xl border-0 bg-gradient-to-b from-[#200f4d] via-[#3c2086] to-[#5d2ab8] p-0 text-white">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Solar System Complete</DialogTitle>
              <DialogDescription className="text-purple-100">
                You completed all 8 planets and fused every planet badge into one special achievement.
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
                      alt={planet.name}
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
              <p className="font-bold text-yellow-100">Solar System Master Badge</p>
            </div>
            <Button onClick={() => setShowFinalCelebration(false)} className="mt-6 w-full rounded-2xl bg-white text-[#3a237d] hover:bg-purple-50">
              Awesome
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLegendaryCelebration} onOpenChange={(open) => !open && setShowLegendaryCelebration(false)}>
        <DialogContent className="legendary-overlay fixed inset-0 max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-[#040714] p-0 text-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Legendary Cosmic Badge Unlocked</DialogTitle>
            <DialogDescription>
              Full-screen celebration with a star-drop intro and all badges merging into the rarest badge.
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
                  <Image src={stage.image} alt={stage.name} width={26} height={26} className="h-6 w-6 rounded-full border border-white/70 object-cover" />
                </div>
              ))}
            </div>

            <div className="legendary-core">
              <Image src="/planets/milky-way.svg" alt="Legendary badge" width={120} height={120} className="h-28 w-28 rounded-full object-cover shadow-[0_0_40px_rgba(244,114,182,0.55)]" />
            </div>

            <div className="legendary-copy">
              <h2 className="text-3xl font-black tracking-tight">Legendary Cosmic Badge Unlocked</h2>
              <p className="mt-2 text-sm text-fuchsia-100">
                You completed every world and galaxy. All badges merged into the rarest one.
              </p>
              <Button onClick={() => setShowLegendaryCelebration(false)} className="mt-5 rounded-2xl bg-white px-6 text-[#3b155f] hover:bg-fuchsia-50">
                Claim Legendary Badge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
