"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Save, Trash2, Plus } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"

interface JournalEntry {
  id: string
  date: string
  content: string
  mood?: string
}

function JournalContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [viewMode, setViewMode] = useState<"write" | "read">("write")

  useEffect(() => {
    const saved = localStorage.getItem("journalEntries")
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  const saveEntry = () => {
    if (!currentEntry.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentEntry,
      mood: selectedMood,
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
    setCurrentEntry("")
    setSelectedMood("")
    setViewMode("read")
  }

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id)
    setEntries(updatedEntries)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
  }

  const moods = [
    { emoji: "😊", label: lang === "en" ? "Happy" : lang === "es" ? "Feliz" : "سعيد" },
    { emoji: "😢", label: lang === "en" ? "Sad" : lang === "es" ? "Triste" : "حزين" },
    { emoji: "😰", label: lang === "en" ? "Anxious" : lang === "es" ? "Ansioso" : "قلق" },
    { emoji: "😌", label: lang === "en" ? "Calm" : lang === "es" ? "Tranquilo" : "هادئ" },
    { emoji: "😡", label: lang === "en" ? "Angry" : lang === "es" ? "Enojado" : "غاضب" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-6 pb-24">
        <div className="text-center space-y-3">
          <BookOpen className="w-16 h-16 mx-auto text-amber-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.journalTitle}</h2>
          <p className="text-lg text-gray-600 px-4">{t.journalDesc}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setViewMode("write")}
            className={`h-12 px-8 rounded-2xl text-lg font-semibold ${viewMode === "write" ? "bg-amber-500 text-white" : "bg-white text-gray-700"}`}
          >
            <Plus className="w-5 h-5 mr-2" />
            {lang === "en" ? "Write" : lang === "es" ? "Escribir" : "اكتب"}
          </Button>
          <Button
            onClick={() => setViewMode("read")}
            className={`h-12 px-8 rounded-2xl text-lg font-semibold ${viewMode === "read" ? "bg-amber-500 text-white" : "bg-white text-gray-700"}`}
          >
            {lang === "en" ? "Read" : lang === "es" ? "Leer" : "اقرأ"} ({entries.length})
          </Button>
        </div>

        {viewMode === "write" && (
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                {lang === "en" ? "How are you feeling?" : lang === "es" ? "¿Cómo te sientes?" : "كيف تشعر؟"}
              </label>
              <div className="flex gap-3 flex-wrap">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood.label)}
                    className={`px-5 py-3 rounded-2xl border-2 transition-all ${
                      selectedMood === mood.label
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="text-3xl mr-2">{mood.emoji}</span>
                    <span className="text-base font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                {lang === "en"
                  ? "What's on your mind?"
                  : lang === "es"
                    ? "¿Qué tienes en mente?"
                    : "ما الذي يدور في ذهنك؟"}
              </label>
              <textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder={
                  lang === "en"
                    ? "Write your thoughts here..."
                    : lang === "es"
                      ? "Escribe tus pensamientos aquí..."
                      : "اكتب أفكارك هنا..."
                }
                className="w-full h-52 p-5 border-2 border-gray-200 rounded-2xl resize-none focus:border-amber-500 focus:outline-none text-base"
              />
            </div>

            <Button
              onClick={saveEntry}
              disabled={!currentEntry.trim()}
              className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-6 h-6" />
              {lang === "en" ? "Save Entry" : lang === "es" ? "Guardar Entrada" : "حفظ الإدخال"}
            </Button>
          </div>
        )}

        {viewMode === "read" && (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-gray-500 text-lg">
                {lang === "en"
                  ? "No journal entries yet. Start writing!"
                  : lang === "es"
                    ? "Aún no hay entradas de diario. ¡Comienza a escribir!"
                    : "لا توجد إدخالات في اليومية حتى الآن. ابدأ الكتابة!"}
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-3xl p-6 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-base text-gray-500">{new Date(entry.date).toLocaleDateString(lang)}</div>
                      {entry.mood && (
                        <div className="text-base font-medium text-gray-700 mt-1">
                          {lang === "en" ? "Mood" : lang === "es" ? "Estado de ánimo" : "المزاج"}: {entry.mood}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-gray-900 text-base whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      }
    >
      <JournalContent />
    </Suspense>
  )
}
