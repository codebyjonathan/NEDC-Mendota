"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useRef, useEffect } from "react"
import { Music, Play, Pause, Volume2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"

function MusicContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const experiences = [
    {
      id: "beach",
      name: lang === "en" ? "Beach Meditation" : lang === "es" ? "Meditación en la Playa" : "تأمل الشاطئ",
      description:
        lang === "en"
          ? "Guided relaxation by the ocean"
          : lang === "es"
            ? "Relajación guiada junto al océano"
            : "استرخاء موجه بجانب المحيط",
      color: "from-blue-400 to-cyan-300",
      image: "/peaceful-beach-sunset-waves.jpg",
      url: "/beach-sound.mp4",
      voice:
        lang === "en"
          ? "Close your eyes and breathe deeply. Feel the gentle ocean breeze. You are safe, you are calm."
          : lang === "es"
            ? "Cierra los ojos y respira profundamente. Siente la suave brisa del océano. Estás seguro, estás tranquilo."
            : "أغمض عينيك وتنفس بعمق. اشعر بنسيم المحيط اللطيف. أنت آمن، أنت هادئ.",
    },
    {
      id: "forest",
      name: lang === "en" ? "Forest Serenity" : lang === "es" ? "Serenidad del Bosque" : "هدوء الغابة",
      description:
        lang === "en"
          ? "Nature sounds with calming voice"
          : lang === "es"
            ? "Sonidos de la naturaleza con voz tranquilizadora"
            : "أصوات الطبيعة مع صوت مهدئ",
      color: "from-green-400 to-emerald-300",
      image: "/peaceful-forest-trees-sunlight.jpg",
      url: "https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3",
      voice:
        lang === "en"
          ? "Let the sounds of nature wash over you. Release your worries with each breath. You deserve peace."
          : lang === "es"
            ? "Deja que los sonidos de la naturaleza te envuelvan. Libera tus preocupaciones con cada respiración. Mereces paz."
            : "دع أصوات الطبيعة تغمرك. أطلق همومك مع كل نفس. أنت تستحق السلام.",
    },
    {
      id: "rain",
      name: lang === "en" ? "Rainfall Meditation" : lang === "es" ? "Meditación de Lluvia" : "تأمل المطر",
      description:
        lang === "en"
          ? "Soothing rain with affirmations"
          : lang === "es"
            ? "Lluvia relajante con afirmaciones"
            : "مطر مهدئ مع التأكيدات",
      color: "from-slate-400 to-blue-300",
      image: "/rain-drops-window-peaceful-evening.jpg",
      url: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
      voice:
        lang === "en"
          ? "Each drop of rain washes away your stress. You are becoming lighter, freer, more at peace with each moment."
          : lang === "es"
            ? "Cada gota de lluvia lava tu estrés. Te vuelves más ligero, más libre, más en paz con cada momento."
            : "كل قطرة مطر تغسل التوتر. أنت تصبح أخف، أكثر حرية، أكثر سلامًا مع كل لحظة.",
    },
    {
      id: "night",
      name: lang === "en" ? "Starry Night" : lang === "es" ? "Noche Estrellada" : "ليلة النجوم",
      description:
        lang === "en"
          ? "Evening calm with gentle guidance"
          : lang === "es"
            ? "Calma nocturna con guía suave"
            : "هدوء المساء مع إرشاد لطيف",
      color: "from-indigo-500 to-purple-400",
      image: "/starry-night-sky-peaceful-stars.jpg",
      url: "/space-feeling.mp4",
      voice:
        lang === "en"
          ? "Under the vast night sky, know that you matter. Your feelings are valid. Tomorrow brings new hope."
          : lang === "es"
            ? "Bajo el vasto cielo nocturno, sabe que importas. Tus sentimientos son válidos. Mañana trae nueva esperanza."
            : "تحت السماء الليلية الشاسعة، اعلم أنك مهم. مشاعرك صحيحة. الغد يحمل أملاً جديداً.",
    },
  ]

  const togglePlay = (experience: (typeof experiences)[0]) => {
    if (playing === experience.id) {
      audioRef.current?.pause()
      setPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(experience.url)
      audio.loop = true
      audio.play()
      audioRef.current = audio
      setPlaying(experience.id)
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-8 pb-24">
        <div className="text-center space-y-3">
          <Music className="w-16 h-16 mx-auto text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.musicTitle}</h2>
          <p className="text-lg text-gray-600 px-4">{t.musicDesc}</p>
        </div>

        <div className="space-y-6">
          {experiences.map((experience) => {
            const isPlaying = playing === experience.id

            return (
              <div
                key={experience.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`h-56 bg-gradient-to-br ${experience.color} relative overflow-hidden`}>
                  <img
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <button
                    onClick={() => togglePlay(experience)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-indigo-600" />
                      ) : (
                        <Play className="w-12 h-12 text-indigo-600 ml-1" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{experience.name}</h3>
                    <p className="text-base text-gray-600 mt-2">{experience.description}</p>
                  </div>

                  {isPlaying && (
                    <div className="bg-indigo-50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-indigo-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-3/4 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-base text-indigo-900 italic leading-relaxed">{experience.voice}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-gray-900">
            {lang === "en"
              ? "Benefits of Guided Meditation"
              : lang === "es"
                ? "Beneficios de la Meditación Guiada"
                : "فوائد التأمل الموجه"}
          </h3>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>
                {lang === "en"
                  ? "Reduces stress and promotes deep relaxation"
                  : lang === "es"
                    ? "Reduce el estrés y promueve la relajación profunda"
                    : "يقلل من التوتر ويعزز الاسترخاء العميق"}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>
                {lang === "en"
                  ? "Improves emotional regulation and mood"
                  : lang === "es"
                    ? "Mejora la regulación emocional y el estado de ánimo"
                    : "يحسن التنظيم العاطفي والمزاج"}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>
                {lang === "en"
                  ? "Creates a peaceful mental space for healing"
                  : lang === "es"
                    ? "Crea un espacio mental pacífico para sanar"
                    : "يخلق مساحة ذهنية سلمية للشفاء"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function MusicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <MusicContent />
    </Suspense>
  )
}
