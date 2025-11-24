// app/safety-plan/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Send, Sparkles, Download, Save } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { translations, type Language } from "@/lib/translations";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function SafetyPlanContent() {
  const searchParams = useSearchParams();
  const langParam = searchParams?.get?.("lang") || "en";
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? (langParam as Language) : "en";
  const t = translations[lang];
  const isRTL = lang === "ar";

  const [viewMode, setViewMode] = useState<"chat" | "plan">("chat");

  // Plan input (what the user types for their plan)
  const [planInput, setPlanInput] = useState<string>("");

  // Saved plan (persisted in localStorage). Guard for window.
  const getSavedPlan = () => {
    try {
      if (typeof window === "undefined") return "";
      return localStorage.getItem("safetyPlan") || "";
    } catch {
      return "";
    }
  };
  const [savedPlan, setSavedPlan] = useState<string>(getSavedPlan());

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initial assistant greeting message (system/assistant)
  useEffect(() => {
    const initialAssistant = {
      id: "initial-assistant",
      role: "assistant" as const,
      content:
        lang === "en"
          ? "Hello, I'm here to help you create a personalized Safety Plan. This plan will help you stay safe during difficult moments. Let's start by getting to know you better. What's your name, and what brings you here today?"
          : lang === "es"
          ? "Hola, estoy aquí para ayudarte a crear un Plan de Seguridad personalizado. Este plan te ayudará a mantenerte seguro durante momentos difíciles. Comencemos por conocerte mejor. ¿Cuál es tu nombre y qué te trae aquí hoy?"
          : "مرحبًا، أنا هنا لمساعدتك في إنشاء خطة سلامة شخصية. ستساعدك هذه الخطة على البقاء آمنًا خلال اللحظات الصعبة. لنبدأ بالتعرف عليك بشكل أفضل. ما اسمك، وما الذي يجعلك هنا اليوم؟",
    } as ChatMessage;

    setMessages([initialAssistant]);
  }, [lang]);

  // Save plan handler
  const savePlan = () => {
    if (!planInput.trim()) return;
    setSavedPlan(planInput);
    try {
      localStorage.setItem("safetyPlan", planInput);
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    alert(lang === "en" ? "Safety Plan saved!" : lang === "es" ? "¡Plan de Seguridad guardado!" : "تم حفظ خطة السلامة!");
    // Optionally switch to "plan" view
    setViewMode("plan");
  };

  // Download plan handler
  const downloadPlan = () => {
    const content = savedPlan || planInput || "";
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-safety-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Input key handler for Enter => save plan when focused on planInput field
  const handlePlanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      savePlan();
    }
  };

  // Chat: submit handler that streams assistant response from /api/safety-chat
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add the user's message locally
    const userMsg: ChatMessage = { id: String(Date.now()) + "-u", role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);

    // Prepare messages to send to API (system prompt will be added server-side by your API)
    const outgoing = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    // Clear input and set loading
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/safety-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Chat API error: ${res.status} ${text}`);
      }

      // Stream reading
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body from chat API");
      }

      const decoder = new TextDecoder();
      let assistantId = String(Date.now()) + "-a";
      // Insert a placeholder assistant message so UI shows typing immediately
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          // Update the assistant placeholder with the accumulated partial text
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)),
          );
        }
        done = streamDone;
      }

      // Finalize (already updated in loop). Ensure isLoading cleared
    } catch (err) {
      console.error("Chat submit error:", err);
      // Append an error assistant message so the user sees feedback
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now()) + "-err", role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 mx-auto text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t.safetyPlan}</h2>
          <p className="text-gray-600">{t.createSafety}</p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => setViewMode("chat")}
            className={`h-10 px-6 rounded-xl font-semibold ${viewMode === "chat" ? "bg-teal-500 text-white" : "bg-white text-gray-700"}`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {lang === "en" ? "Create with AI" : lang === "es" ? "Crear con IA" : "أنشئ بالذكاء الاصطناعي"}
          </Button>
          <Button
            onClick={() => setViewMode("plan")}
            className={`h-10 px-6 rounded-xl font-semibold ${viewMode === "plan" ? "bg-teal-500 text-white" : "bg-white text-gray-700"}`}
          >
            {lang === "en" ? "My Plan" : lang === "es" ? "Mi Plan" : "خطتي"}
          </Button>
        </div>

        {viewMode === "chat" && (
          <>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <p className="text-sm text-teal-800 text-center">
                {lang === "en"
                  ? "Our AI counselor will guide you through creating a personalized safety plan. Be honest and thoughtful in your responses."
                  : lang === "es"
                  ? "Nuestro consejero de IA te guiará en la creación de un plan de seguridad personalizado. Sé honesto y reflexivo en tus respuestas."
                  : "سيرشدك مستشارنا الذكي خلال إنشاء خطة سلامة شخصية. كن صادقًا ومدروسًا في إجاباتك."}
              </p>
            </div>

            {/* Chat area */}
            <div className="space-y-4">
              {/* Messages container */}
              <div className="flex flex-col gap-3 bg-white border border-teal-100 rounded-2xl p-4 max-h-[420px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user" ? "self-end bg-teal-500 text-white" : "self-start bg-gray-50 text-gray-900 shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}

                {isLoading && (
                  <div className="self-start bg-gray-50 rounded-2xl px-4 py-3 shadow-sm w-28">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={lang === "en" ? "Type your message..." : lang === "es" ? "Escribe tu mensaje..." : "اكتب رسالتك..."}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="h-12 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>

              {/* Plan input + save */}
              <div className="flex gap-2">
                <input
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  onKeyDown={handlePlanKeyDown}
                  placeholder={lang === "en" ? "Type your plan..." : lang === "es" ? "Escribe tu plan..." : "اكتب خطتك..."}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
                <Button onClick={savePlan} className="h-12 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {lang === "en" ? "Save Plan" : lang === "es" ? "Guardar Plan" : "حفظ الخطة"}
                </Button>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-sm text-teal-800 text-center">
                {lang === "en" ? "AI suggestions will appear above." : lang === "es" ? "Las sugerencias de IA aparecerán arriba." : "ستظهر اقتراحات الذكاء الاصطناعي أعلاه."}
              </div>
            </div>
          </>
        )}

        {viewMode === "plan" && (
          <div className="bg-white rounded-2xl p-5 shadow-md">
            {savedPlan ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {lang === "en" ? "Your Safety Plan" : lang === "es" ? "Tu Plan de Seguridad" : "خطة السلامة الخاصة بك"}
                </h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">{savedPlan}</pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadPlan} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    {lang === "en" ? "Download Plan" : lang === "es" ? "Descargar Plan" : "تحميل الخطة"}
                  </Button>
                  <Button
                    onClick={() => {
                      setViewMode("chat");
                      setPlanInput(savedPlan);
                    }}
                    className="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    {lang === "en" ? "Edit Plan" : lang === "es" ? "Editar Plan" : "تحرير الخطة"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {lang === "en" ? "No safety plan saved yet. Create one with AI!" : lang === "es" ? "Aún no hay un plan de seguridad guardado. ¡Crea uno con IA!" : "لم يتم حفظ خطة سلامة بعد. أنشئ واحدة مع الذكاء الاصطناعي!"}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}

export default function SafetyPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      }
    >
      <SafetyPlanContent />
    </Suspense>
  );
}
