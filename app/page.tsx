"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const router = useRouter()

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language)
    router.push(`/main?lang=${language}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8FFF8F] via-[#4FD663] to-[#2FB84A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/40 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md flex flex-col items-center space-y-8">
        <div className="relative w-64 h-64">
          <Image
            src="/logo.png"
            alt="Safe Space Logo"
            width={256}
            height={256}
            className="w-full h-full object-contain drop-shadow-2xl"
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

        <p className="text-3xl font-serif text-gray-800 italic">You're Not Alone.</p>

        <div className="w-64">
          <Select value={selectedLanguage} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-full h-14 bg-gray-800/80 hover:bg-gray-800 text-white border-none rounded-full text-lg font-medium shadow-lg">
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
        </div>
      </div>
    </div>
  )
}
