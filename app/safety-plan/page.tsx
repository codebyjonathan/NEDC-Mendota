"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Mic, Save, Send, Sparkles, Square, Volume2 } from "lucide-react"
import jsPDF from "jspdf"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"
import { translations, type Language } from "@/lib/translations"
import { isLikelyOffensiveText } from "@/lib/chat-safety"

type ChatRole = "user" | "assistant"
type ChatMessage = { role: ChatRole; content: string }
type RobotStyleId = "default" | "heart" | "custom"
type RobotShape = "circle" | "rounded" | "squircle"
type RobotExpression = "smile" | "wink" | "calm"
type RobotAccessory = "spark" | "heart" | "shield" | "leaf" | "star"

type CustomRobotConfig = {
  shellColor: string
  faceColor: string
  accentColor: string
  shape: RobotShape
  expression: RobotExpression
  accessory: RobotAccessory
}

const ROBOT_STYLES: Array<{ id: Exclude<RobotStyleId, "custom">; label: string; icon: string }> = [
  { id: "default", label: "Default", icon: "🤖" },
  { id: "heart", label: "Heart", icon: "❤️" },
]

const DEFAULT_CUSTOM_ROBOT: CustomRobotConfig = {
  shellColor: "#6d7cff",
  faceColor: "#fff7d6",
  accentColor: "#ff8a5b",
  shape: "rounded",
  expression: "smile",
  accessory: "spark",
}

const SELECTED_ROBOT_STORAGE_KEY = "selectedRobot"
const CUSTOM_ROBOT_STORAGE_KEY = "customRobot"

export default function SafetyPlanPage({ lang: _lang }: { lang?: string }) {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || _lang || "en") as Language
  const t = translations[lang]

  const [activeTab, setActiveTab] = useState<"ai" | "plan" | "saved">("ai")
  const [myPlan, setMyPlan] = useState("")
  const [input, setInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: "assistant", content: t.greeting }])
  const [loading, setLoading] = useState(false)
  const [reportedAssistantMessages, setReportedAssistantMessages] = useState<number[]>([])
  const [selectedRobot, setSelectedRobot] = useState<RobotStyleId>("default")
  const [isRobotMenuOpen, setIsRobotMenuOpen] = useState(false)
  const [customRobot, setCustomRobot] = useState<CustomRobotConfig>(DEFAULT_CUSTOM_ROBOT)
  const [listeningAI, setListeningAI] = useState(false)
  const [listeningPlan, setListeningPlan] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    markSolarGoalCompleted("visit_safety_plan_screen")
  }, [])

  useEffect(() => {
    const savedRobot = localStorage.getItem(SELECTED_ROBOT_STORAGE_KEY)
    if (savedRobot === "default" || savedRobot === "heart" || savedRobot === "custom") {
      setSelectedRobot(savedRobot)
    }

    const savedCustomRobot = localStorage.getItem(CUSTOM_ROBOT_STORAGE_KEY)
    if (!savedCustomRobot) return

    try {
      setCustomRobot({ ...DEFAULT_CUSTOM_ROBOT, ...(JSON.parse(savedCustomRobot) as Partial<CustomRobotConfig>) })
    } catch {
      localStorage.setItem(CUSTOM_ROBOT_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_ROBOT))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CUSTOM_ROBOT_STORAGE_KEY, JSON.stringify(customRobot))
  }, [customRobot])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chatMessages, loading])

  const handleRobotChange = (robotId: RobotStyleId) => {
    setSelectedRobot(robotId)
    localStorage.setItem(SELECTED_ROBOT_STORAGE_KEY, robotId)
  }

  const startSpeechRecognition = (setter: Dispatch<SetStateAction<string>>, micType: "ai" | "plan") => {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert(t.speechRecognitionUnsupported)
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // no-op
      }
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = lang === "ar" ? "ar-SA" : lang === "es" ? "es-ES" : "en-US"
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1
    let baseText = ""
    setter((prev) => {
      baseText = prev
      return prev
    })
    recognition.onstart = () => (micType === "ai" ? setListeningAI(true) : setListeningPlan(true))
    recognition.onend = () => (micType === "ai" ? setListeningAI(false) : setListeningPlan(false))
    recognition.onerror = (event: { error?: string }) => {
      micType === "ai" ? setListeningAI(false) : setListeningPlan(false)
      if (event.error === "aborted" || event.error === "no-speech") return
      alert(t.speechRecognitionFailed)
    }
    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      const nextText = transcript.trim()
      setter(nextText ? `${baseText}${baseText ? " " : ""}${nextText}` : baseText)
    }
    try {
      recognition.start()
    } catch {
      micType === "ai" ? setListeningAI(false) : setListeningPlan(false)
      alert(t.speechRecognitionFailed)
    }
  }

  const sendMessage = async () => {
    const userText = input.trim()
    if (!userText) return
    if (isLikelyOffensiveText(userText)) {
      alert("Unable to send this message because it appears offensive or unsafe.")
      return
    }

    const userMessage = { role: "user", content: userText } as ChatMessage
    const newMessages = [...chatMessages, userMessage]
    const instantAssistant = { role: "assistant", content: t.typing } as ChatMessage
    setChatMessages([...newMessages, instantAssistant])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/safety-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json().catch(() => null)
      if (res.status === 400 && data?.blocked) {
        alert(data?.text || "Unable to send this message because it appears offensive or unsafe.")
        setChatMessages(newMessages)
        setLoading(false)
        return
      }
      const finalText =
        res.ok && data?.text
          ? data.text
          : "Safe AI is temporarily unavailable. Please try again in a moment."
      setChatMessages((prev) => {
        const next = [...prev]
        const index = next.findIndex((m) => m.role === "assistant" && m.content === t.typing)
        if (index >= 0) {
          next[index] = { role: "assistant", content: finalText }
          return next
        }
        return [...next, { role: "assistant", content: finalText }]
      })
    } catch {
      setChatMessages((prev) => {
        const next = [...prev]
        const index = next.findIndex((m) => m.role === "assistant" && m.content === t.typing)
        if (index >= 0) {
          next[index] = { role: "assistant", content: "Something went wrong. Please try again." }
          return next
        }
        return [...next, { role: "assistant", content: "Something went wrong. Please try again." }]
      })
    } finally {
      setLoading(false)
    }
  }

  const reportAssistantMessage = async (messageIndex: number, content: string) => {
    if (reportedAssistantMessages.includes(messageIndex)) return

    try {
      await fetch("/api/safety-chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "offensive_or_unsafe",
          message: content,
        }),
      })
      setReportedAssistantMessages((prev) => [...prev, messageIndex])
    } catch {
      alert("Unable to submit report right now. Please try again.")
    }
  }

  const handleSavePlan = () => {
    if (!myPlan.trim()) return
    setActiveTab("saved")
    markSolarGoalCompleted("save_safety_plan")
  }

  const header = useMemo(() => <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />, [t])

  const stopSpeaking = () => {
    if (typeof window === "undefined") return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // no-op
    }
    setSpeakingMessageId(null)
  }

  const speakMessage = (messageId: string, text: string) => {
    if (typeof window === "undefined") return
    const value = text.trim()
    if (!value) return
    if (!("speechSynthesis" in window)) {
      alert(t.ttsUnsupported)
      return
    }
    if (speakingMessageId === messageId) {
      stopSpeaking()
      return
    }
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(value)
      utterance.lang = lang === "ar" ? "ar-SA" : lang === "es" ? "es-ES" : "en-US"
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => setSpeakingMessageId((prev) => (prev === messageId ? null : prev))
      utterance.onerror = () => setSpeakingMessageId((prev) => (prev === messageId ? null : prev))
      setSpeakingMessageId(messageId)
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeakingMessageId(null)
      alert(t.ttsFailed)
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // no-op
        }
        recognitionRef.current = null
      }
      if (typeof window === "undefined") return
      try {
        window.speechSynthesis.cancel()
      } catch {
        // no-op
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {header}

      <div className="flex flex-1 flex-col space-y-6 px-4 py-6">
        <div className="mb-4 inline-flex self-center rounded-2xl border bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === "ai" ? "app-cta shadow" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <Sparkles className="h-4 w-4" />
            {t.createSafety}
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === "plan" ? "app-cta shadow" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {t.safetyPlan}
          </button>
        </div>

        {activeTab === "ai" && (
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border bg-gray-50">
            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <RobotVisual selectedRobot={selectedRobot} customRobot={customRobot} size="header" />
                <span className="font-bold" style={{ color: "var(--app-accent-strong)" }}>
                  Safe AI
                </span>
              </div>

              <Popover open={isRobotMenuOpen} onOpenChange={setIsRobotMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="rounded-full px-3 py-1 text-xs transition"
                    style={{ backgroundColor: "var(--app-accent-soft)", color: "var(--app-accent-strong)" }}
                  >
                    Customize
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[22rem] rounded-3xl border border-gray-200 bg-white p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Choose Your AI Icon</h3>
                      <p className="mt-1 text-xs text-gray-600">Use a preset or build your own simple character.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {ROBOT_STYLES.map((robot) => (
                        <button
                          key={robot.id}
                          onClick={() => handleRobotChange(robot.id)}
                          className={`rounded-2xl border p-3 transition ${selectedRobot === robot.id ? "border-transparent bg-gray-50" : "border-gray-200 hover:bg-gray-50"}`}
                          style={selectedRobot === robot.id ? { boxShadow: "0 0 0 2px var(--app-accent)" } : undefined}
                        >
                          <div className="text-2xl font-bold">{robot.icon}</div>
                          <div className="mt-2 text-[11px] font-medium text-gray-700">{robot.label}</div>
                        </button>
                      ))}
                      <button
                        onClick={() => handleRobotChange("custom")}
                        className={`rounded-2xl border p-3 transition ${selectedRobot === "custom" ? "border-transparent bg-gray-50" : "border-gray-200 hover:bg-gray-50"}`}
                        style={selectedRobot === "custom" ? { boxShadow: "0 0 0 2px var(--app-accent)" } : undefined}
                      >
                        <div className="flex justify-center">
                          <RobotVisual selectedRobot="custom" customRobot={customRobot} size="picker" />
                        </div>
                        <div className="mt-2 text-[11px] font-medium text-gray-700">Create your own</div>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Custom icon builder</p>
                          <p className="text-xs text-gray-600">Design a simple AI character style.</p>
                        </div>
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <RobotVisual selectedRobot="custom" customRobot={customRobot} size="header" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <ColorInput label="Shell" value={customRobot.shellColor} onChange={(value) => setCustomRobot({ ...customRobot, shellColor: value })} />
                        <ColorInput label="Face" value={customRobot.faceColor} onChange={(value) => setCustomRobot({ ...customRobot, faceColor: value })} />
                        <ColorInput label="Accent" value={customRobot.accentColor} onChange={(value) => setCustomRobot({ ...customRobot, accentColor: value })} />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <ChoiceGroup label="Shape" value={customRobot.shape} options={[{ value: "circle", label: "Circle" }, { value: "rounded", label: "Rounded" }, { value: "squircle", label: "Squircle" }]} onChange={(value) => setCustomRobot({ ...customRobot, shape: value as RobotShape })} />
                        <ChoiceGroup label="Mood" value={customRobot.expression} options={[{ value: "smile", label: "Smile" }, { value: "wink", label: "Wink" }, { value: "calm", label: "Calm" }]} onChange={(value) => setCustomRobot({ ...customRobot, expression: value as RobotExpression })} />
                        <ChoiceGroup label="Accent" value={customRobot.accessory} options={[{ value: "spark", label: "Spark" }, { value: "heart", label: "Heart" }, { value: "shield", label: "Shield" }, { value: "leaf", label: "Leaf" }, { value: "star", label: "Star" }]} onChange={(value) => setCustomRobot({ ...customRobot, accessory: value as RobotAccessory })} />
                      </div>

                      <button onClick={() => handleRobotChange("custom")} className="app-cta mt-3 w-full rounded-2xl px-4 py-2 text-sm font-medium">
                        Use my custom icon
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white p-4">
              {chatMessages.map((message, index) => (
                <ChatBubble
                  key={index}
                  messageId={`msg_${index}`}
                  role={message.role}
                  content={message.content}
                  selectedRobot={selectedRobot}
                  customRobot={customRobot}
                  onReport={message.role === "assistant" ? () => reportAssistantMessage(index, message.content) : undefined}
                  isReported={reportedAssistantMessages.includes(index)}
                  onReadAloud={() => speakMessage(`msg_${index}`, message.content)}
                  isSpeaking={speakingMessageId === `msg_${index}`}
                  t={t}
                />
              ))}
              {loading && <div className="mt-2 text-sm italic text-gray-500">{t.typing}</div>}
            </div>

            <div className="flex items-center gap-2 border-t bg-white p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
                className="flex-1 rounded-2xl border bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                placeholder={t.typeYourMessage}
              />

              <div className="flex items-center gap-2">
                {listeningAI && (
                  <span className="text-sm font-medium" style={{ color: "var(--app-accent-strong)" }}>
                    {t.listening}
                  </span>
                )}
                <button
                  onClick={() => startSpeechRecognition(setInput, "ai")}
                  className={`inline-flex items-center justify-center rounded-full p-3 text-white shadow hover:brightness-110 ${listeningAI ? "animate-ping-slow" : ""}`}
                  style={{ backgroundColor: "var(--app-accent-strong)" }}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={sendMessage}
                className="inline-flex items-center justify-center rounded-full p-3 text-white shadow hover:brightness-110"
                style={{ backgroundColor: "var(--app-accent-strong)" }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "plan" && (
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">{t.typeYourPlan}</label>

            <div className="relative flex items-center">
              <textarea
                value={myPlan}
                onChange={(event) => setMyPlan(event.target.value)}
                className="w-full flex-1 resize-none rounded-2xl border px-4 py-3 text-sm placeholder:text-gray-400"
                placeholder={t.writeSafetyPlanHere}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {listeningPlan && (
                  <span className="text-xs font-medium" style={{ color: "var(--app-accent-strong)" }}>
                    {t.listening}
                  </span>
                )}
                <button
                  onClick={() => startSpeechRecognition(setMyPlan, "plan")}
                  className={`inline-flex items-center justify-center rounded-full p-2 text-white shadow hover:brightness-110 ${listeningPlan ? "animate-ping-slow" : ""}`}
                  style={{ backgroundColor: "var(--app-accent-strong)" }}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={handleSavePlan}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110"
                style={{ backgroundColor: "var(--app-accent-strong)" }}
              >
                <Save className="h-4 w-4" />
                {t.savePlan}
              </button>
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">{t.yourSavedPlan}</label>
            <div className="flex-1 overflow-y-auto rounded-2xl border bg-gray-50 p-4 whitespace-pre-wrap" style={{ color: "var(--app-text)" }}>
              {myPlan || t.noPlanSavedYet}
            </div>
            {myPlan && (
              <button
                onClick={() => {
                  const doc = new jsPDF()
                  const pageWidth = doc.internal.pageSize.getWidth()
                  const margin = 10
                  const lines = doc.splitTextToSize(myPlan, pageWidth - margin * 2)
                  doc.text(lines, margin, 20)
                  doc.save("safety-plan.pdf")
                }}
                className="mt-4 inline-flex items-center gap-2 self-start rounded-2xl px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110"
                style={{ backgroundColor: "var(--app-accent-strong)" }}
              >
                <Download className="h-4 w-4" />
                {t.downloadPlan}
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs text-gray-600">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
      />
    </label>
  )
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1 text-xs text-gray-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RobotVisual({
  selectedRobot,
  customRobot,
  size,
}: {
  selectedRobot: RobotStyleId
  customRobot: CustomRobotConfig
  size: "picker" | "header" | "chat"
}) {
  if (selectedRobot !== "custom") {
    const preset = ROBOT_STYLES.find((robot) => robot.id === selectedRobot) || ROBOT_STYLES[0]
    const className = size === "picker" ? "text-2xl font-bold" : "text-xl font-bold"
    return <span className={className}>{preset.icon}</span>
  }

  return <CustomRobotIcon config={customRobot} size={size} />
}

function CustomRobotIcon({
  config,
  size,
}: {
  config: CustomRobotConfig
  size: "picker" | "header" | "chat"
}) {
  const dimensions = size === "picker" ? "h-14 w-14" : size === "chat" ? "h-10 w-10" : "h-11 w-11"
  const faceDimensions = size === "picker" ? "h-9 w-9" : size === "chat" ? "h-6 w-6" : "h-7 w-7"
  const shapeClass = config.shape === "circle" ? "rounded-full" : config.shape === "rounded" ? "rounded-[1.25rem]" : "rounded-[35%]"

  return (
    <div className={`relative ${dimensions} ${shapeClass} shadow-sm`} style={{ backgroundColor: config.shellColor }}>
      <div
        className={`absolute left-1/2 top-1/2 ${faceDimensions} -translate-x-1/2 -translate-y-1/2 rounded-[40%]`}
        style={{ backgroundColor: config.faceColor }}
      >
        <div className="absolute left-1/2 top-[32%] flex -translate-x-1/2 gap-1.5">
          <Eye expression={config.expression} side="left" />
          <Eye expression={config.expression} side="right" />
        </div>
        <Mouth expression={config.expression} />
      </div>

      <div
        className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-[10px] text-white shadow-sm"
        style={{ backgroundColor: config.accentColor }}
      >
        {getAccessoryGlyph(config.accessory)}
      </div>
    </div>
  )
}

function Eye({ expression, side }: { expression: RobotExpression; side: "left" | "right" }) {
  if ((expression === "wink" && side === "right") || expression === "calm") return <span className="mt-1 block h-[2px] w-2 rounded-full bg-slate-700" />
  return <span className="block h-2 w-2 rounded-full bg-slate-700" />
}

function Mouth({ expression }: { expression: RobotExpression }) {
  if (expression === "calm") return <span className="absolute left-1/2 top-[64%] block h-[2px] w-4 -translate-x-1/2 rounded-full bg-slate-700" />
  return <span className="absolute left-1/2 top-[58%] block h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-slate-700" />
}

function getAccessoryGlyph(accessory: RobotAccessory) {
  switch (accessory) {
    case "heart":
      return "❤"
    case "shield":
      return "🛡"
    case "leaf":
      return "🍃"
    case "star":
      return "★"
    default:
      return "✦"
  }
}

function ChatBubble({
  messageId,
  role,
  content,
  selectedRobot,
  customRobot,
  onReport,
  isReported,
  onReadAloud,
  isSpeaking,
  t,
}: ChatMessage & {
  messageId: string
  selectedRobot: RobotStyleId
  customRobot: CustomRobotConfig
  onReport?: () => void
  isReported?: boolean
  onReadAloud?: () => void
  isSpeaking?: boolean
  t: (typeof translations)["en"]
}) {
  if (role === "assistant") {
    return (
      <div className="mb-3 flex items-start gap-2">
        <div className="flex items-center gap-2 text-lg font-bold" style={{ color: "var(--app-accent-strong)" }}>
          <RobotVisual selectedRobot={selectedRobot} customRobot={customRobot} size="chat" />
          <span>Safe AI</span>
        </div>
        <div className="max-w-[85%] rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-sm leading-relaxed" style={{ color: "var(--app-text)" }}>{content}</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
                onClick={onReadAloud}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              title={isSpeaking ? t.stopAudio : t.readAloud}
            >
              {isSpeaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {isSpeaking ? t.stop : t.readAloud}
            </button>
            {onReport && (
              <button
                onClick={onReport}
                disabled={isReported}
                className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReported ? t.reported : t.report}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 flex items-end justify-end gap-2">
      <div className="max-w-[85%] rounded-2xl p-3 text-sm text-white shadow-sm" style={{ backgroundColor: "var(--app-accent-strong)" }}>
        <p>{content}</p>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onReadAloud}
            className="inline-flex items-center gap-1 rounded-full border border-white/40 px-2 py-1 text-xs text-white hover:bg-white/15"
            title={isSpeaking ? t.stopAudio : t.readAloud}
          >
            {isSpeaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isSpeaking ? t.stop : t.readAloud}
          </button>
        </div>
      </div>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--app-accent)" }}>
        U
      </div>
    </div>
  )
}
