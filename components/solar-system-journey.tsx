"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import Image from "next/image"
import { BadgeCheck, Rocket, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  SOLAR_PLANETS,
  consumeFinalCelebration,
  consumeNextPlanetCelebration,
  getNextUnfinishedPlanet,
  getSolarProgressState,
  getUnlockedPlanetCount,
  getUnlockedPlanets,
  subscribeToSolarProgress,
  resetSolarProgress,
  type SolarPlanet,
  type SolarProgressState,
} from "@/lib/solar-system-goals"

export function SolarSystemJourney({ className = "" }: { className?: string }) {
  const [progressState, setProgressState] = useState<SolarProgressState>({
    completedGoals: [],
    shownUnlockCount: 0,
    finalShown: false,
    updatedAt: new Date(0).toISOString(),
  })
  const [ready, setReady] = useState(false)
  const [planetCelebration, setPlanetCelebration] = useState<SolarPlanet | null>(null)
  const [showFinalCelebration, setShowFinalCelebration] = useState(false)

  useEffect(() => {
    setReady(true)
    setProgressState(getSolarProgressState())
    return subscribeToSolarProgress(() => {
      setProgressState(getSolarProgressState())
    })
  }, [])

  const unlockedCount = getUnlockedPlanetCount(progressState)
  const unlockedPlanets = getUnlockedPlanets(progressState)
  const nextPlanet = getNextUnfinishedPlanet(progressState)
  const totalPlanets = SOLAR_PLANETS.length
  const rocketPercent = useMemo(() => (unlockedCount / totalPlanets) * 100, [unlockedCount, totalPlanets])
  const completionPercent = useMemo(() => Math.round((unlockedCount / totalPlanets) * 100), [unlockedCount, totalPlanets])
  const currentPlanet = unlockedCount > 0 ? SOLAR_PLANETS[Math.min(unlockedCount, totalPlanets) - 1] : null

  useEffect(() => {
    if (!ready || planetCelebration || showFinalCelebration) return
    const pendingPlanet = consumeNextPlanetCelebration()
    if (pendingPlanet) {
      setProgressState(getSolarProgressState())
      setPlanetCelebration(pendingPlanet)
      return
    }
    if (consumeFinalCelebration()) {
      setProgressState(getSolarProgressState())
      setShowFinalCelebration(true)
    }
  }, [ready, progressState, planetCelebration, showFinalCelebration])

  const handleResetForTesting = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Reset Solar Journey progress for testing?")
      if (!confirmed) return
    }
    resetSolarProgress()
    setProgressState(getSolarProgressState())
    setPlanetCelebration(null)
    setShowFinalCelebration(false)
  }

  return (
    <>
      <section
        className={`overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-[#0f1736] via-[#1d2d6d] to-[#2f4ea1] p-5 text-white shadow-lg ${className}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Daily Solar Journey</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetForTesting}
              className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
              title="Reset progress for testing"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {completionPercent}% complete
            </span>
          </div>
        </div>

        <p className="mb-3 text-sm text-blue-100">
          Complete app activities and fly to each planet. Every planet unlocks a new badge.
        </p>

        <div className="relative rounded-2xl bg-black/15 px-3 py-2">
          <div className="relative h-20 w-full">
            <div className="absolute left-2 right-2 top-11 h-1 rounded-full bg-white/20" />
            <div
              className="absolute left-2 top-11 h-1 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-orange-300 transition-all duration-[1200ms]"
              style={{ width: `calc((100% - 1rem) * ${rocketPercent / 100})` }}
            />

            <div
              className="absolute top-0 -translate-x-1/2 transition-all duration-[1200ms]"
              style={{ left: `calc(0.5rem + (100% - 1rem) * ${rocketPercent / 100})` }}
            >
              <div className="solar-rocket-combo relative">
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

            {SOLAR_PLANETS.map((planet, index) => {
              const planetPosition = ((index + 1) / totalPlanets) * 100
              const unlocked = index < unlockedCount
              return (
                <div
                  key={planet.id}
                  className="absolute top-9 -translate-x-1/2 text-center"
                  style={{ left: `calc(0.5rem + (100% - 1rem) * ${planetPosition / 100})` }}
                >
                  <div
                    className={`solar-planet-bob mx-auto rounded-full transition-all ${
                      unlocked ? "scale-105 opacity-100" : "opacity-70 grayscale-[0.2]"
                    }`}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <Image
                      src={planet.image}
                      alt={planet.name}
                      width={20}
                      height={20}
                      className={`h-5 w-5 rounded-full border object-cover shadow-md ${unlocked ? "border-white" : "border-white/35"}`}
                    />
                  </div>
                  <p className={`mt-1 hidden text-[9px] font-semibold sm:block ${unlocked ? "text-white" : "text-blue-200"}`}>{planet.name}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-2.5">
            {currentPlanet ? (
              <p>
                <span className="font-semibold text-blue-100">Current:</span> {currentPlanet.name}
              </p>
            ) : (
              <p>
                <span className="font-semibold text-blue-100">Current:</span> Launch Pad
              </p>
            )}
          </div>
          <div className="rounded-xl bg-white/10 p-2.5">
            {nextPlanet ? (
              <p>
                <span className="font-semibold text-blue-100">Next:</span> {nextPlanet.name}
              </p>
            ) : (
              <p className="flex items-center gap-2 font-semibold text-emerald-200">
                <Rocket className="h-3.5 w-3.5" />
                Journey complete
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 rounded-2xl bg-white/10 p-3 text-sm">
          {nextPlanet ? (
            <p>
              <span className="font-semibold">Next mission:</span> {nextPlanet.goalLabel}
            </p>
          ) : (
            <p className="flex items-center gap-2 font-semibold text-emerald-200">
              <Rocket className="h-4 w-4" />
              All planet missions completed.
            </p>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-100">Planet badges</p>
          <div className="flex flex-wrap gap-2">
            {unlockedPlanets.map((planet) => (
              <span key={planet.id} className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold">
                <Image src={planet.image} alt={planet.name} width={14} height={14} className="h-3.5 w-3.5 rounded-full" />
                {planet.name}
              </span>
            ))}
            {unlockedPlanets.length === 0 && <span className="text-xs text-blue-100">No badges yet.</span>}
            {unlockedCount === totalPlanets && (
              <span className="solar-final-badge inline-flex items-center gap-1 rounded-full border border-yellow-200/70 bg-yellow-100/20 px-2.5 py-1 text-xs font-bold text-yellow-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                Solar System Master
              </span>
            )}
          </div>
        </div>
      </section>

      <Dialog open={Boolean(planetCelebration)} onOpenChange={(open) => !open && setPlanetCelebration(null)}>
        <DialogContent className="max-w-md rounded-3xl border-0 bg-gradient-to-b from-[#11204b] to-[#2b4b96] p-0 text-white">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Congratulations!</DialogTitle>
              <DialogDescription className="text-blue-100">
                You reached {planetCelebration?.name} and unlocked a new badge.
              </DialogDescription>
            </DialogHeader>
            {planetCelebration && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <Image src={planetCelebration.image} alt={planetCelebration.name} width={56} height={56} className="solar-celebrate-pop h-14 w-14 rounded-full border-2 border-white shadow-md" />
                <div>
                  <p className="text-sm text-blue-100">New badge unlocked</p>
                  <p className="text-lg font-bold">{planetCelebration.name}</p>
                </div>
              </div>
            )}
            <Button onClick={() => setPlanetCelebration(null)} className="mt-6 w-full rounded-2xl bg-white text-[#1d2d6d] hover:bg-blue-50">
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
                You completed all 8 missions and fused every planet badge into one special achievement.
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
    </>
  )
}
