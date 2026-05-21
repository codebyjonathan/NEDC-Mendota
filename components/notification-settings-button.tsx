"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { BellRing, Settings2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { Language } from "@/lib/translations"

const I18N = {
  en: {
    triggerAria: "Notification settings",
    title: "Notification Settings",
    description: "Manage browser push alerts and daily in-app reminders for this device.",
    backgroundTitle: "Background browser notifications",
    backgroundDesc: "Receive check-in reminders when Safe Space is not the active tab.",
    backgroundAria: "Enable background browser notifications",
    pushEnabled: "Background push is enabled on this device.",
    pushEnableHint: "Enable this to receive browser push notifications.",
    pushUnknown: "Push server status has not been confirmed yet. Try enabling push to verify this device.",
    pushUnsupported: "This browser does not support push notifications.",
    browserPermission: "Browser permission",
    sendTestPush: "Send test push",
    testPushOk: "Test push sent to this device.",
    testPushFail: "Unable to send a test push.",
    dailyTitle: "Daily motivational check-in",
    dailyDesc: "Send a random motivational reminder every day at 7:00 AM.",
    dailyAria: "Enable daily motivational reminder",
    dailyInfo: "Each day uses a different quote when possible, and the preference stays saved after reload.",
    dailyTestNow: "Test daily reminder now",
    dailyTestOk: "Daily motivation test scheduled. You should see it in about 3 seconds.",
    dailyTestFail: "Unable to send daily motivation test.",
    limitationTitle: "Current browser limitation",
    limitationBody:
      "Daily reminders and scheduled check-ins are fully reliable while the app or local scheduler is active. For production-grade delivery across closed browsers, restarts, or multiple devices, a durable backend scheduler or push service worker backend job is still required.",
  },
  es: {
    triggerAria: "Configuración de notificaciones",
    title: "Configuración de Notificaciones",
    description: "Administra alertas push del navegador y recordatorios diarios dentro de la app para este dispositivo.",
    backgroundTitle: "Notificaciones en segundo plano del navegador",
    backgroundDesc: "Recibe recordatorios de chequeo cuando Safe Space no sea la pestaña activa.",
    backgroundAria: "Activar notificaciones en segundo plano del navegador",
    pushEnabled: "Las notificaciones push en segundo plano están activadas en este dispositivo.",
    pushEnableHint: "Activa esto para recibir notificaciones push del navegador.",
    pushUnknown: "El estado del servidor push aún no se confirma. Intenta activar push para verificar este dispositivo.",
    pushUnsupported: "Este navegador no es compatible con notificaciones push.",
    browserPermission: "Permiso del navegador",
    sendTestPush: "Enviar push de prueba",
    testPushOk: "Push de prueba enviado a este dispositivo.",
    testPushFail: "No se pudo enviar una notificación push de prueba.",
    dailyTitle: "Chequeo motivacional diario",
    dailyDesc: "Envía un recordatorio motivacional aleatorio todos los días a las 7:00 AM.",
    dailyAria: "Activar recordatorio motivacional diario",
    dailyInfo: "Cada día usa una cita diferente cuando es posible, y la preferencia queda guardada después de recargar.",
    dailyTestNow: "Probar recordatorio diario ahora",
    dailyTestOk: "Prueba motivacional diaria programada. Deberías verla en unos 3 segundos.",
    dailyTestFail: "No se pudo enviar la prueba motivacional diaria.",
    limitationTitle: "Limitación actual del navegador",
    limitationBody:
      "Los recordatorios diarios y chequeos programados son totalmente confiables mientras la app o el programador local estén activos. Para entrega de nivel producción con navegadores cerrados, reinicios o múltiples dispositivos, aún se requiere un programador backend duradero o un trabajo backend del service worker push.",
  },
  ar: {
    triggerAria: "إعدادات الإشعارات",
    title: "إعدادات الإشعارات",
    description: "إدارة تنبيهات المتصفح الفورية وتذكيرات التطبيق اليومية لهذا الجهاز.",
    backgroundTitle: "إشعارات المتصفح في الخلفية",
    backgroundDesc: "استلم تذكيرات تسجيل الحالة عندما لا يكون Safe Space هو التبويب النشط.",
    backgroundAria: "تفعيل إشعارات المتصفح في الخلفية",
    pushEnabled: "إشعارات الدفع في الخلفية مفعّلة على هذا الجهاز.",
    pushEnableHint: "فعّل هذا لاستلام إشعارات دفع من المتصفح.",
    pushUnknown: "لم يتم تأكيد حالة خادم الدفع بعد. حاول التفعيل للتحقق من هذا الجهاز.",
    pushUnsupported: "هذا المتصفح لا يدعم إشعارات الدفع.",
    browserPermission: "إذن المتصفح",
    sendTestPush: "إرسال إشعار دفع تجريبي",
    testPushOk: "تم إرسال إشعار دفع تجريبي إلى هذا الجهاز.",
    testPushFail: "تعذر إرسال إشعار دفع تجريبي.",
    dailyTitle: "تسجيل تحفيزي يومي",
    dailyDesc: "إرسال تذكير تحفيزي عشوائي يوميًا الساعة 7:00 صباحًا.",
    dailyAria: "تفعيل التذكير التحفيزي اليومي",
    dailyInfo: "يستخدم كل يوم اقتباسًا مختلفًا عند الإمكان، ويتم حفظ التفضيل بعد إعادة التحميل.",
    dailyTestNow: "اختبار التذكير اليومي الآن",
    dailyTestOk: "تمت جدولة اختبار التذكير التحفيزي اليومي. يجب أن يظهر خلال حوالي 3 ثوانٍ.",
    dailyTestFail: "تعذر إرسال اختبار التذكير التحفيزي اليومي.",
    limitationTitle: "القيود الحالية للمتصفح",
    limitationBody:
      "تذكيرات اليوم والجدولة موثوقة بالكامل طالما التطبيق أو المجدول المحلي يعملان. ولتسليم موثوق على مستوى الإنتاج عبر المتصفحات المغلقة أو إعادة التشغيل أو أجهزة متعددة، لا يزال يلزم وجود مجدول خلفي دائم أو مهمة خلفية لخدمة دفع worker.",
  },
} as const

export function NotificationSettingsButton() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang = (langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en") as Language
  const t = I18N[lang]

  // Goal 1: Improve accessibility and overall user interaction.
  // This settings surface centralizes notification controls with accessible labels,
  // clear status messaging, and immediate feedback after user actions.
  const {
    settings,
    loading,
    error,
    permission,
    pushSupported,
    pushSubscribed,
    pushConfigured,
    enablePush,
    disablePush,
    sendTestPush,
    sendTestDailyMotivation,
    updateDailyMotivation,
  } = useNotifications()
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [dailyTestMessage, setDailyTestMessage] = useState<string | null>(null)

  const handlePushToggle = async (checked: boolean) => {
    if (checked) {
      await enablePush()
      return
    }

    await disablePush()
  }

  const handleDailyToggle = async (checked: boolean) => {
    try {
      await updateDailyMotivation(checked)
    } catch {
      // Provider already manages the error message
    }
  }

  const handleTest = async () => {
    const success = await sendTestPush()
    setTestMessage(success ? t.testPushOk : t.testPushFail)
    window.setTimeout(() => setTestMessage(null), 4000)
  }

  const handleDailyTest = async () => {
    const success = await sendTestDailyMotivation()
    setDailyTestMessage(
      success
        ? t.dailyTestOk
        : t.dailyTestFail
    )
    window.setTimeout(() => setDailyTestMessage(null), 5000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-100"
          aria-label={t.triggerAria}
        >
          <Settings2 className="h-5 w-5 text-gray-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b bg-gray-50 px-6 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-gray-900">
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {/* Interaction strength: guided push setup with explicit capability/permission state. */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.backgroundTitle}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {t.backgroundDesc}
                </p>
              </div>
              <Switch
                checked={pushSubscribed}
                disabled={!pushSupported || loading}
                onCheckedChange={handlePushToggle}
                aria-label={t.backgroundAria}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {pushSupported
                ? pushConfigured
                  ? pushSubscribed
                    ? t.pushEnabled
                    : t.pushEnableHint
                  : t.pushUnknown
                : t.pushUnsupported}
            </p>
            <p className="mt-1 text-xs text-gray-500">{t.browserPermission}: {permission}</p>
            {pushSubscribed && pushConfigured && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleTest}
                disabled={loading}
              >
                {t.sendTestPush}
              </Button>
            )}
            {testMessage && <p className="mt-2 text-xs text-emerald-700">{testMessage}</p>}
          </div>

          {/* Personalization strength: user-controlled daily motivation flow with testable feedback. */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.dailyTitle}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {t.dailyDesc}
                </p>
              </div>
              <Switch
                checked={settings.dailyMotivationEnabled}
                disabled={loading}
                onCheckedChange={handleDailyToggle}
                aria-label={t.dailyAria}
              />
            </div>
            <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-800">
              {t.dailyInfo}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleDailyTest}
              disabled={loading}
            >
              {t.dailyTestNow}
            </Button>
            {dailyTestMessage && <p className="mt-2 text-xs text-emerald-700">{dailyTestMessage}</p>}
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <BellRing className="h-4 w-4" />
              {t.limitationTitle}
            </div>
            <p className="mt-2">
              {t.limitationBody}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
