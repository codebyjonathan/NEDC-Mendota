"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { translations, type Language } from "@/lib/translations";
import { Shield, Sparkles, Send, Save, Download } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

// --- Types ---
type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

export default function SafetyPlanPage({ lang: _lang }: { lang?: string }) {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") || _lang || "en") as Language;
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<"ai" | "plan" | "saved">("ai");
  const [myPlan, setMyPlan] = useState("");
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t.greeting },
  ]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: input.trim() }];
    setChatMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/safety-chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.text || "No response from AI." }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleSavePlan = () => {
    if (myPlan.trim()) setActiveTab("saved");
  };

  const header = useMemo(() => <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />, [t]);

  // --- Speech-to-text for chat input ---
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ar" ? "ar-SA" : lang === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = () => alert("Speech recognition failed. Try again.");
    recognition.start();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {header}

      <div className="flex-1 flex flex-col px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm border mb-4 self-center">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "ai" ? "bg-teal-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {t.createSafety}
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === "plan" ? "bg-teal-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.safetyPlan}
          </button>
        </div>

        {/* Chat Area */}
        {activeTab === "ai" && (
          <div className="flex-1 flex flex-col rounded-3xl border bg-gray-50 overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white p-4">
              {chatMessages.map((m, i) => (
                <ChatBubble key={i} role={m.role} content={m.content} />
              ))}
              {loading && <div className="mt-2 text-sm italic text-gray-500">Typing…</div>}
            </div>

            <div className="flex items-center gap-2 p-3 border-t bg-white relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 rounded-2xl border bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                placeholder="Type your message…"
              />
              <button
                onClick={handleVoiceInput}
                className="absolute right-16 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-teal-500 p-2 text-white shadow hover:brightness-110"
              >
                🎤
              </button>
              <button
                onClick={sendMessage}
                className="inline-flex items-center justify-center rounded-full bg-teal-600 p-3 text-white shadow hover:brightness-110"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Plan Composer */}
        {activeTab === "plan" && (
          <div className="flex-1 flex flex-col rounded-3xl border bg-white p-4 overflow-hidden">
            <label className="mb-2 block text-sm font-medium text-gray-700">Type your plan…</label>
            <div className="relative flex items-center">
              <textarea
                value={myPlan}
                onChange={(e) => setMyPlan(e.target.value)}
                className="flex-1 w-full resize-none rounded-2xl border px-4 py-3 text-sm placeholder:text-gray-400"
                placeholder="Write your safety plan here…"
              />
              <button
                onClick={() => {
                  const SpeechRecognition =
                    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRecognition) {
                    alert("Speech recognition is not supported in this browser.");
                    return;
                  }
                  const recognition = new SpeechRecognition();
                  recognition.lang = lang === "ar" ? "ar-SA" : lang === "es" ? "es-ES" : "en-US";
                  recognition.interimResults = false;
                  recognition.maxAlternatives = 1;

                  recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setMyPlan((prev) => prev + (prev ? " " : "") + transcript);
                  };

                  recognition.onerror = () => alert("Speech recognition failed. Try again.");
                  recognition.start();
                }}
                className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-teal-600 p-2 text-white shadow hover:brightness-110"
              >
                🎤
              </button>
            </div>
            <div className="mt-3 flex justify-end items-center">
              <button
                onClick={handleSavePlan}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110"
              >
                <Save className="h-4 w-4" />
                Save Plan
              </button>
            </div>
          </div>
        )}

        {/* Saved Plan */}
        {activeTab === "saved" && (
          <div className="flex-1 flex flex-col rounded-3xl border bg-white p-4 overflow-hidden">
            <label className="mb-2 block text-sm font-medium text-gray-700">Your Saved Plan</label>
            <div className="flex-1 overflow-y-auto rounded-2xl border p-4 bg-gray-50 text-gray-800 whitespace-pre-wrap">
              {myPlan || "No plan saved yet."}
            </div>
            {myPlan && (
              <button
                onClick={() => {
                  const blob = new Blob([myPlan], { type: "text/plain;charset=utf-8" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "safety-plan.pdf";
                  link.click();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:brightness-110"
              >
                <Download className="h-4 w-4" />
                Download Plan
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}

// --- UI helpers ---
function ChatBubble({ role, content }: ChatMessage) {
  if (role === "assistant") {
    return (
      <div className="mb-3 flex items-start gap-2">
        <div className="h-8 w-8 shrink-0 rounded-full bg-teal-600 text-white grid place-items-center text-xs font-bold">
          AI
        </div>
        <div className="max-w-[85%] rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-end justify-end gap-2">
      <div className="max-w-[85%] rounded-2xl bg-teal-600 p-3 text-sm text-white shadow-sm">{content}</div>
      <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500 text-white grid place-items-center text-xs font-bold">
        U
      </div>
    </div>
  );
}