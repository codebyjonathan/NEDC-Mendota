"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { setIntroAudioLoop, stopIntroAudio } from "@/lib/intro-audio"
import { navigateWithViewTransition } from "@/lib/view-transition"

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [linkChecked, setLinkChecked] = useState(false) // Track checklist state
  const router = useRouter()

  useEffect(() => {
    setIntroAudioLoop(true)
  }, [])

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    stopIntroAudio(true)
    navigateWithViewTransition(() => {
      router.push(`/main?lang=${language}`)
    })
  }

  // Link button click handler
  const handleLinkClick = () => {
    const url = "https://forms.gle/Lt2i4K3nkQvb7RvM9" // <-- Put your counselor link here
    window.open(url, "_blank") // Opens in a new tab
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8FFF8F] via-[#4FD663] to-[#2FB84A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/40 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md flex flex-col items-center space-y-8">
        <div className="relative w-80 h-80">
          {/* Glow around logo */}
          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl" />
          <Image
            src="/logo.png"
            alt="Safe Space Logo"
            width={350}
            height={350}
            className="w-full h-full object-contain drop-shadow-2xl relative z-10"
            priority
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-7xl font-black text-black leading-none tracking-tight">
            SAFE
            <br />
            SPACE
          </h1>
        </div>

        <p className="text-3xl font-serif text-gray-100 italic">You're Not Alone!</p>

        <div className="w-64 flex flex-col items-center space-y-4">
          <Select value={selectedLanguage} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-full h-14 bg-gray-200 hover:bg-gray-300 text-black border-none rounded-full text-lg font-medium shadow-lg">
              <SelectValue placeholder="Languages ▼" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="en" className="text-lg py-3 cursor-pointer">
                🇺🇸 English
              </SelectItem>
              <SelectItem value="es" className="text-lg py-3 cursor-pointer">
                🇪🇸 Español
              </SelectItem>
              <SelectItem value="ar" className="text-lg py-3 cursor-pointer">
                🇸🇦 العربية
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Checklist with minimal circular button */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer space-x-2 text-black font-medium">
              <input
                type="checkbox"
                className="w-4 h-4 accent-green-500"
                checked={linkChecked}
                onChange={() => setLinkChecked(!linkChecked)}
              />
              <span className="text-[13px]">Link to your MHS Counselor</span>
            </label>

            {/* Minimal circular button appears only if checklist is checked */}
            {linkChecked && (
              <button
                onClick={handleLinkClick}
                className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center relative shadow-sm hover:shadow-md transition"
              >
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-full bg-green-400/30 blur-sm animate-pulse"></div>
                {/* Checkmark */}
                <span className="relative text-green-700 font-semibold text-base">✔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
