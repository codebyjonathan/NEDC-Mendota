"use client"

import { useEffect, useState } from "react"
import { Oxanium } from "next/font/google"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { setIntroAudioLoop, stopIntroAudio } from "@/lib/intro-audio"
import { navigateWithViewTransition } from "@/lib/view-transition"

const oxanium = Oxanium({ subsets: ["latin"], weight: ["600", "700", "800"] })

const ambientStars = [
  { left: "8%", top: "11%", size: "sm", delay: "0ms" },
  { left: "14%", top: "33%", size: "md", delay: "300ms" },
  { left: "22%", top: "71%", size: "sm", delay: "700ms" },
  { left: "29%", top: "18%", size: "sm", delay: "120ms" },
  { left: "35%", top: "57%", size: "lg", delay: "500ms" },
  { left: "41%", top: "25%", size: "sm", delay: "860ms" },
  { left: "47%", top: "78%", size: "md", delay: "210ms" },
  { left: "53%", top: "37%", size: "sm", delay: "640ms" },
  { left: "58%", top: "63%", size: "md", delay: "140ms" },
  { left: "64%", top: "21%", size: "sm", delay: "980ms" },
  { left: "69%", top: "81%", size: "sm", delay: "420ms" },
  { left: "74%", top: "43%", size: "lg", delay: "220ms" },
  { left: "80%", top: "17%", size: "sm", delay: "760ms" },
  { left: "86%", top: "66%", size: "md", delay: "350ms" },
  { left: "92%", top: "29%", size: "sm", delay: "90ms" },
]

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [linkChecked, setLinkChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIntroAudioLoop(true)
  }, [])

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    stopIntroAudio(true)
    navigateWithViewTransition(
      () => {
        router.push(`/main?lang=${language}`)
      },
      { style: "directional" },
    )
  }

  const handleLinkClick = () => {
    const url = "https://forms.gle/Lt2i4K3nkQvb7RvM9"
    window.open(url, "_blank")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030611] px-4 py-8 text-slate-100">
      <div className="absolute inset-0 bg-[url('/starry-night-sky-peaceful-stars.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(90,152,255,0.3),transparent_42%),radial-gradient(circle_at_76%_18%,rgba(132,91,255,0.22),transparent_38%),linear-gradient(180deg,rgba(2,4,10,0.58),rgba(2,4,10,0.92))]" />
      <div className="absolute inset-0">
        {ambientStars.map((star, index) => (
          <span
            key={`${star.left}-${star.top}-${index}`}
            className={`starter-star starter-star-${star.size}`}
            style={{ left: star.left, top: star.top, animationDelay: star.delay }}
          />
        ))}
        <span className="starter-asteroid starter-asteroid-a" />
        <span className="starter-asteroid starter-asteroid-b" />
        <span className="starter-asteroid starter-asteroid-c" />
        <span className="starter-meteor starter-meteor-a" />
        <span className="starter-meteor starter-meteor-b" />
        <span className="starter-meteor starter-meteor-c" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center space-y-8">
        <div className="relative h-80 w-80">
          <div className="absolute inset-0 rounded-full bg-cyan-300/25 blur-3xl" />
          <Image
            src="/logo.png"
            alt="Safe Space Logo"
            width={350}
            height={350}
            className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_30px_rgba(125,211,252,0.55)]"
            priority
          />
        </div>

        <div className="space-y-2 text-center">
          <h1
            className={`${oxanium.className} text-7xl font-bold leading-none tracking-[0.1em] text-cyan-50 drop-shadow-[0_2px_14px_rgba(56,189,248,0.38)]`}
          >
            SAFE
            <br />
            SPACE
          </h1>
        </div>

        <p className="text-3xl font-semibold italic text-cyan-100/90">You're Not Alone!</p>

        <div className="flex w-64 flex-col items-center space-y-4">
          <Select value={selectedLanguage} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="h-14 w-full rounded-full border border-cyan-200/20 bg-slate-950/55 text-base font-semibold text-sky-50 data-[placeholder]:text-white shadow-[0_12px_28px_rgba(2,6,23,0.55)] backdrop-blur-md transition hover:bg-slate-900/70">
              <SelectValue placeholder="Languages" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-cyan-200/20 bg-slate-950/95 text-sky-50">
              <SelectItem value="en" className="cursor-pointer py-3 text-lg">
                {"\uD83C\uDDFA\uD83C\uDDF8 English"}
              </SelectItem>
              <SelectItem value="es" className="cursor-pointer py-3 text-lg">
                {"\uD83C\uDDEA\uD83C\uDDF8 Espa\u00F1ol"}
              </SelectItem>
              <SelectItem value="ar" className="cursor-pointer py-3 text-lg">
                {"\uD83C\uDDF8\uD83C\uDDE6 \u0627\u0644\u0639\u0631\u0628\u064A\u0629"}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <label className="flex cursor-pointer items-center space-x-2 text-sm font-medium text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 accent-cyan-400"
                checked={linkChecked}
                onChange={() => setLinkChecked(!linkChecked)}
              />
              <span>Link to your MHS Counselor</span>
            </label>

            {linkChecked && (
              <button
                onClick={handleLinkClick}
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50/90 shadow-sm transition hover:shadow-md"
              >
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/35 blur-sm" />
                <span className="relative text-base font-semibold text-cyan-700">{"\u2714"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

