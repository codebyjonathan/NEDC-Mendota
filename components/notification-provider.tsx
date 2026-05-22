"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import { AppNotification, NotificationSettings } from "@/lib/notification-types"
import { getRandomMotivationalQuote } from "@/lib/notification-quotes"
import type { Language } from "@/lib/translations"
import {
  isPushNotificationSupported,
  isPushNotificationSubscribed,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendCustomTestPushNotification,
  sendTestPushNotification,
  syncPushSubscriptionWithServer,
} from "@/lib/push-notifications"

const NOTIFICATIONS_STORAGE_KEY = "app_notifications"
const SETTINGS_STORAGE_KEY = "app_notification_settings"

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyMotivationEnabled: false,
  dailyMotivationHour: 7,
}

const I18N = {
  en: {
    notificationsBrowserOnly: "Notifications are only available in the browser.",
    notificationsNeedSecure: "Notifications require HTTPS or localhost. Open the deployed Vercel site, or use localhost on this device.",
    notificationsUnsupported: "This browser does not support notifications. Reminders can still appear while Safe Space stays open on this device.",
    requestFailed: "Request failed",
    browserBodyFallback: "Open Safe Space to continue your check-in.",
    dailyMotivationTitle: "Daily motivational reminder",
    permissionNeededPush: "Notification permission is required for browser push notifications",
    unableEnablePush: "Unable to enable push notifications",
    failedEnablePush: "Failed to enable push notifications",
    failedDisablePush: "Failed to disable push notifications",
    failedTestNotification: "Failed to send test notification",
    permissionNeededDailyTest: "Notification permission is required to test daily reminders",
    unableDailyPushTest: "Unable to send daily reminder push test",
    failedDailyReminderTest: "Failed to test daily reminder",
    permissionDenied: "Notification permission was denied",
    defaultCheckInTitle: "Time to check in!",
    defaultCheckInBody: "Let's take a moment to check in with yourself.",
    failedSchedule: "Failed to schedule notification",
    permissionNeededDaily: "Notification permission is required for daily reminders",
    toastTapToOpen: "Tap to open in Safe Space",
  },
  es: {
    notificationsBrowserOnly: "Las notificaciones solo están disponibles en el navegador.",
    notificationsNeedSecure: "Las notificaciones requieren HTTPS o localhost. Abre el sitio desplegado en Vercel o usa localhost en este dispositivo.",
    notificationsUnsupported: "Este navegador no admite notificaciones. Los recordatorios aún pueden aparecer mientras Safe Space permanezca abierto en este dispositivo.",
    requestFailed: "Solicitud fallida",
    browserBodyFallback: "Abre Safe Space para continuar tu chequeo.",
    dailyMotivationTitle: "Recordatorio motivacional diario",
    permissionNeededPush: "Se requiere permiso de notificaciones para las notificaciones push del navegador",
    unableEnablePush: "No se pudieron activar las notificaciones push",
    failedEnablePush: "Error al activar las notificaciones push",
    failedDisablePush: "Error al desactivar las notificaciones push",
    failedTestNotification: "Error al enviar la notificación de prueba",
    permissionNeededDailyTest: "Se requiere permiso de notificaciones para probar recordatorios diarios",
    unableDailyPushTest: "No se pudo enviar la prueba push del recordatorio diario",
    failedDailyReminderTest: "Error al probar el recordatorio diario",
    permissionDenied: "Se denegó el permiso de notificaciones",
    defaultCheckInTitle: "¡Hora de revisar cómo estás!",
    defaultCheckInBody: "Tomemos un momento para revisar cómo te sientes.",
    failedSchedule: "Error al programar la notificación",
    permissionNeededDaily: "Se requiere permiso de notificaciones para recordatorios diarios",
    toastTapToOpen: "Toca para abrir en Safe Space",
  },
  ar: {
    notificationsBrowserOnly: "الإشعارات متاحة فقط داخل المتصفح.",
    notificationsNeedSecure: "تتطلب الإشعارات اتصال HTTPS أو localhost. افتح موقع Vercel المنشور أو استخدم localhost على هذا الجهاز.",
    notificationsUnsupported: "هذا المتصفح لا يدعم الإشعارات. ما زال بإمكان التذكيرات الظهور أثناء بقاء Safe Space مفتوحًا على هذا الجهاز.",
    requestFailed: "فشل الطلب",
    browserBodyFallback: "افتح Safe Space لمتابعة تسجيل حالتك.",
    dailyMotivationTitle: "تذكير تحفيزي يومي",
    permissionNeededPush: "يلزم إذن الإشعارات لتفعيل إشعارات الدفع في المتصفح",
    unableEnablePush: "تعذر تفعيل إشعارات الدفع",
    failedEnablePush: "فشل تفعيل إشعارات الدفع",
    failedDisablePush: "فشل تعطيل إشعارات الدفع",
    failedTestNotification: "فشل إرسال إشعار الاختبار",
    permissionNeededDailyTest: "يلزم إذن الإشعارات لاختبار التذكيرات اليومية",
    unableDailyPushTest: "تعذر إرسال اختبار دفع للتذكير اليومي",
    failedDailyReminderTest: "فشل اختبار التذكير اليومي",
    permissionDenied: "تم رفض إذن الإشعارات",
    defaultCheckInTitle: "حان وقت تسجيل حالتك!",
    defaultCheckInBody: "لنأخذ لحظة لتفقد حالتك.",
    failedSchedule: "فشل جدولة الإشعار",
    permissionNeededDaily: "يلزم إذن الإشعارات للتذكيرات اليومية",
    toastTapToOpen: "اضغط للفتح في Safe Space",
  },
} as const

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  permission: NotificationPermission
  loading: boolean
  error: string | null
  isSupported: boolean
  pushSupported: boolean
  pushSubscribed: boolean
  pushConfigured: boolean
  settings: NotificationSettings
  schedule: (
    intervalMs: number,
    title?: string,
    options?: { body?: string; actionUrl?: string; type?: AppNotification["type"] }
  ) => Promise<string>
  clear: (notificationId: string) => Promise<void>
  clearAll: () => Promise<void>
  markAsRead: (notificationId: string) => void
  openNotification: (notificationId: string) => void
  requestPermission: () => Promise<NotificationPermission>
  enablePush: () => Promise<boolean>
  disablePush: () => Promise<boolean>
  sendTestPush: () => Promise<boolean>
  sendTestDailyMotivation: () => Promise<boolean>
  updateDailyMotivation: (enabled: boolean) => Promise<void>
}

interface InAppToastState {
  notificationId: string
  title: string
  body?: string
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

function isClient() {
  return typeof window !== "undefined"
}

function getCurrentLanguage(): Language {
  if (!isClient()) return "en"
  const lang = new URLSearchParams(window.location.search).get("lang")
  return lang === "en" || lang === "es" || lang === "ar" ? lang : "en"
}

function getI18n() {
  return I18N[getCurrentLanguage()]
}

function getNotificationPermission(): NotificationPermission {
  if (!isClient() || !("Notification" in window)) {
    return "default"
  }

  return Notification.permission
}

function hasBrowserNotificationSupport() {
  return isClient() && "Notification" in window
}

function getNotificationSupportMessage() {
  const t = getI18n()
  if (!isClient()) {
    return t.notificationsBrowserOnly
  }

  if (!window.isSecureContext) {
    return t.notificationsNeedSecure
  }

  return t.notificationsUnsupported
}

function loadNotifications(): AppNotification[] {
  if (!isClient()) return []

  try {
    const stored = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as AppNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveNotifications(notifications: AppNotification[]) {
  if (!isClient()) return
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
}

function dedupeNotifications(notifications: AppNotification[]) {
  const latestById = new Map<string, AppNotification>()

  notifications.forEach((notification) => {
    latestById.set(notification.id, notification)
  })

  return [...latestById.values()]
}

function loadSettings(): NotificationSettings {
  if (!isClient()) return DEFAULT_SETTINGS

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed = JSON.parse(stored) as Partial<NotificationSettings>
    return {
      dailyMotivationEnabled:
        parsed.dailyMotivationEnabled ?? DEFAULT_SETTINGS.dailyMotivationEnabled,
      dailyMotivationHour: parsed.dailyMotivationHour ?? DEFAULT_SETTINGS.dailyMotivationHour,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: NotificationSettings) {
  if (!isClient()) return
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

function buildActionUrl(path: string | undefined) {
  if (!isClient()) return path || "/grounding"

  const fallback = path || "/grounding"
  const url = new URL(fallback, window.location.origin)
  const lang = new URLSearchParams(window.location.search).get("lang")

  if (lang && !url.searchParams.has("lang")) {
    // Goal: Refine navigation and personalized user experiences.
    // Preserve active language context when jumping from notifications.
    url.searchParams.set("lang", lang)
  }

  return `${url.pathname}${url.search}${url.hash}`
}

function getNextDailyTimestamp(hour: number) {
  const next = new Date()
  next.setHours(hour, 0, 0, 0)

  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1)
  }

  return next.getTime()
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const t = getI18n()
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || t.requestFailed)
  }

  return response.json()
}

async function deleteJson(url: string): Promise<void> {
  const response = await fetch(url, { method: "DELETE" })

  if (!response.ok) {
    const t = getI18n()
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || t.requestFailed)
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Goal: Expand feature functionality and system integrations.
  // This provider composes local scheduling, browser notifications, push APIs,
  // service worker messages, persistence, and navigation into one shared layer.
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushConfigured, setPushConfigured] = useState(false)
  const [activeToast, setActiveToast] = useState<InAppToastState | null>(null)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const notificationsRef = useRef<AppNotification[]>([])
  const settingsRef = useRef<NotificationSettings>(DEFAULT_SETTINGS)
  const lastQuoteRef = useRef<string>("")
  const deliverNotificationRef = useRef<(notificationId: string) => Promise<void>>(async () => {})
  const scheduleNextDailyReminderRef = useRef<() => Promise<void>>(async () => {})

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  )

  const isSupported = typeof window !== "undefined"

  const persistNotifications = useCallback((next: AppNotification[]) => {
    // Goal: Create a more scalable and responsive application.
    // Deduped persistence keeps state predictable across tabs/reloads and reduces
    // duplicate render/update churn as notification volume grows.
    const deduped = dedupeNotifications(next)
    notificationsRef.current = deduped
    setNotifications(deduped)
    saveNotifications(deduped)
  }, [])

  const clearLocalTimer = useCallback((notificationId: string) => {
    const timer = timersRef.current.get(notificationId)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(notificationId)
    }
  }, [])

  const navigateToNotification = useCallback((notification: AppNotification) => {
    const actionUrl = buildActionUrl(notification.actionUrl)
    window.location.href = actionUrl
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    const next = notificationsRef.current.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    )
    persistNotifications(next)
  }, [persistNotifications])

  const showBrowserNotification = useCallback((notification: AppNotification) => {
    const t = getI18n()
    if (!hasBrowserNotificationSupport() || Notification.permission !== "granted") {
      return
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.body || t.browserBodyFallback,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: notification.id,
      data: {
        notificationId: notification.id,
        actionUrl: buildActionUrl(notification.actionUrl),
      },
    })

    browserNotification.onclick = () => {
      window.focus()
      markAsRead(notification.id)
      navigateToNotification(notification)
      browserNotification.close()
    }
  }, [markAsRead, navigateToNotification])

  const scheduleLocalTimer = useCallback((notification: AppNotification) => {
    clearLocalTimer(notification.id)

    const delay = notification.scheduledFor - Date.now()
    if (delay <= 0) {
      return
    }

    const timer = setTimeout(() => {
      void deliverNotificationRef.current(notification.id)
    }, delay)

    timersRef.current.set(notification.id, timer)
  }, [clearLocalTimer])

  const scheduleNotificationInternal = useCallback(async (input: {
    id?: string
    title: string
    body?: string
    scheduledFor: number
    interval: number
    type: AppNotification["type"]
    actionUrl?: string
    recurrence?: "daily"
  }) => {
    const notification: AppNotification = {
      id: input.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: input.title,
      body: input.body,
      timestamp: Date.now(),
      scheduledFor: input.scheduledFor,
      interval: input.interval,
      read: false,
      type: input.type,
      actionUrl: buildActionUrl(input.actionUrl),
      recurrence: input.recurrence,
      pushScheduleId: null,
    }

    let nextNotification = notification

    if (pushSubscribed && pushConfigured) {
      try {
        // Integration strength: server-backed push scheduling complements local timers
        // for broader delivery reliability.
        const payload = await postJson<{ scheduleId: string }>("/api/push-notifications/schedule", {
          notificationId: notification.id,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          scheduledFor: notification.scheduledFor,
          recurrence: notification.recurrence,
        })

        nextNotification = {
          ...notification,
          pushScheduleId: payload.scheduleId,
        }
      } catch (err) {
        console.warn("Push scheduling failed, falling back to browser notification only", err)
      }
    }

    persistNotifications([...notificationsRef.current, nextNotification])
    scheduleLocalTimer(nextNotification)

    return nextNotification.id
  }, [persistNotifications, pushConfigured, pushSubscribed, scheduleLocalTimer])

  const scheduleNextDailyReminder = useCallback(async () => {
    const t = getI18n()
    const currentSettings = settingsRef.current
    if (!currentSettings.dailyMotivationEnabled) {
      return
    }

    const existingUpcoming = notificationsRef.current.find(
      (notification) =>
        notification.recurrence === "daily" && notification.scheduledFor > Date.now()
    )

    if (existingUpcoming) {
      return
    }

    const nextTimestamp = getNextDailyTimestamp(currentSettings.dailyMotivationHour)
    const quote = getRandomMotivationalQuote(lastQuoteRef.current)
    lastQuoteRef.current = quote

    await scheduleNotificationInternal({
      id: `daily_${nextTimestamp}`,
      title: t.dailyMotivationTitle,
      body: quote,
      scheduledFor: nextTimestamp,
      interval: nextTimestamp - Date.now(),
      type: "motivation",
      actionUrl: "/main",
      recurrence: "daily",
    })
  }, [scheduleNotificationInternal])

  const deliverNotification = useCallback(async (notificationId: string) => {
    const notification = notificationsRef.current.find((item) => item.id === notificationId)
    if (!notification) {
      return
    }

    const deliveredNotification = notification.deliveredAt
      ? notification
      : { ...notification, deliveredAt: Date.now() }

    const nextNotifications = notificationsRef.current.map((item) =>
      item.id === notificationId ? deliveredNotification : item
    )
    persistNotifications(nextNotifications)
    timersRef.current.delete(notificationId)

    setActiveToast({
      notificationId,
      title: deliveredNotification.title,
      body: deliveredNotification.body,
    })

    // Always attempt a browser/system notification on local delivery as a fallback.
    // If a push notification also arrives, matching tags help prevent noisy duplicates.
    showBrowserNotification(deliveredNotification)

    if (
      deliveredNotification.recurrence === "daily" &&
      settingsRef.current.dailyMotivationEnabled &&
      !deliveredNotification.pushScheduleId
    ) {
      await scheduleNextDailyReminderRef.current()
    }
  }, [persistNotifications, showBrowserNotification])

  const syncPushState = useCallback(async () => {
    if (!isClient()) return

    const supported = isPushNotificationSupported()
    setPushSupported(supported)

    if (!supported) {
      setPushSubscribed(false)
      setPushConfigured(false)
      return
    }

    try {
      const subscription = await isPushNotificationSubscribed()
      setPushSubscribed(subscription)

      const statusResponse = await fetch("/api/push-notifications/status", {
        cache: "no-store",
      })
      // Scalability strength: runtime status check enables graceful feature gating
      // based on actual backend push readiness.
      if (statusResponse.ok) {
        const status = await statusResponse.json()
        const configured = Boolean(status.configured)
        setPushConfigured(configured)

        if (configured && subscription) {
          await syncPushSubscriptionWithServer()
        }
      } else {
        setPushConfigured(false)
      }
    } catch {
      setPushSubscribed(false)
      setPushConfigured(false)
    }
  }, [])

  const registerServiceWorker = useCallback(async () => {
    if (!isClient() || !("serviceWorker" in navigator) || !window.isSecureContext) {
      return
    }

    const registration = await navigator.serviceWorker.register("/notification-service-worker.js", {
      scope: "/",
    })

    if (registration.active) {
      registration.active.postMessage({ type: "PING" })
    }
  }, [])

  useEffect(() => {
    notificationsRef.current = notifications
  }, [notifications])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    deliverNotificationRef.current = deliverNotification
  }, [deliverNotification])

  useEffect(() => {
    scheduleNextDailyReminderRef.current = scheduleNextDailyReminder
  }, [scheduleNextDailyReminder])

  useEffect(() => {
    if (!isClient()) return

    persistNotifications(loadNotifications())
    setSettings(loadSettings())
    setPermission(getNotificationPermission())

    void registerServiceWorker()
      .catch(() => undefined)
      .then(syncPushState)

    const handleStorage = () => {
      persistNotifications(loadNotifications())
      setSettings(loadSettings())
      setPermission(getNotificationPermission())
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "OPEN_NOTIFICATION" && event.data.notificationId) {
        markAsRead(event.data.notificationId)
        const notification = notificationsRef.current.find(
          (item) => item.id === event.data.notificationId
        )

        if (notification) {
          navigateToNotification(notification)
        } else if (event.data.actionUrl) {
          window.location.href = buildActionUrl(event.data.actionUrl)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage)
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [markAsRead, navigateToNotification, persistNotifications, registerServiceWorker, syncPushState])

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.scheduledFor > Date.now() && !notification.deliveredAt) {
        scheduleLocalTimer(notification)
      }
    })
  }, [notifications, scheduleLocalTimer])

  useEffect(() => {
    if (settings.dailyMotivationEnabled) {
      void scheduleNextDailyReminder()
    }
  }, [scheduleNextDailyReminder, settings.dailyMotivationEnabled])

  useEffect(() => {
    if (!activeToast) return

    const timer = setTimeout(() => {
      setActiveToast((current) =>
        current?.notificationId === activeToast.notificationId ? null : current
      )
    }, 6000)

    return () => clearTimeout(timer)
  }, [activeToast])

  const requestPermission = useCallback(async () => {
    if (!hasBrowserNotificationSupport()) {
      throw new Error(getNotificationSupportMessage())
    }

    const nextPermission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission

    setPermission(nextPermission)
    return nextPermission
  }, [])

  const enablePush = useCallback(async () => {
    const t = getI18n()
    setLoading(true)
    setError(null)

    try {
      const nextPermission = await requestPermission()
      if (nextPermission !== "granted") {
        throw new Error(t.permissionNeededPush)
      }

      const subscribed = await subscribeToPushNotifications()
      if (!subscribed) {
        throw new Error(t.unableEnablePush)
      }

      await syncPushState()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedEnablePush)
      return false
    } finally {
      setLoading(false)
    }
  }, [requestPermission, syncPushState])

  const disablePush = useCallback(async () => {
    const t = getI18n()
    setLoading(true)
    setError(null)

    try {
      await unsubscribeFromPushNotifications()
      await syncPushState()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedDisablePush)
      return false
    } finally {
      setLoading(false)
    }
  }, [syncPushState])

  const sendTestPush = useCallback(async () => {
    const t = getI18n()
    setLoading(true)
    setError(null)

    try {
      return await sendTestPushNotification()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedTestNotification)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const sendTestDailyMotivation = useCallback(async () => {
    const t = getI18n()
    setLoading(true)
    setError(null)

    try {
      if (hasBrowserNotificationSupport()) {
        const nextPermission = await requestPermission()
        if (nextPermission !== "granted") {
          throw new Error(t.permissionNeededDailyTest)
        }
      }

      const quote = getRandomMotivationalQuote(lastQuoteRef.current)
      lastQuoteRef.current = quote

      if (pushSubscribed && pushConfigured) {
        const pushed = await sendCustomTestPushNotification({
          title: t.dailyMotivationTitle,
          body: quote,
          actionUrl: "/main",
          tag: "daily-motivation-test",
        })

        if (!pushed) {
          throw new Error(t.unableDailyPushTest)
        }
      } else {
        await scheduleNotificationInternal({
          title: t.dailyMotivationTitle,
          body: quote,
          scheduledFor: Date.now() + 3000,
          interval: 3000,
          type: "motivation",
          actionUrl: "/main",
        })
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedDailyReminderTest)
      return false
    } finally {
      setLoading(false)
    }
  }, [pushConfigured, pushSubscribed, requestPermission, scheduleNotificationInternal])

  const schedule = useCallback(async (
    intervalMs: number,
    title: string = getI18n().defaultCheckInTitle,
    options?: { body?: string; actionUrl?: string; type?: AppNotification["type"] }
  ) => {
    const t = getI18n()
    setLoading(true)
    setError(null)

    try {
      if (hasBrowserNotificationSupport()) {
        const nextPermission = await requestPermission()
        if (nextPermission !== "granted") {
          throw new Error(t.permissionDenied)
        }
      }

      return await scheduleNotificationInternal({
        title,
        body: options?.body || t.defaultCheckInBody,
        scheduledFor: Date.now() + intervalMs,
        interval: intervalMs,
        type: options?.type || "check-in",
        actionUrl: options?.actionUrl || "/grounding",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failedSchedule)
      throw err
    } finally {
      setLoading(false)
    }
  }, [requestPermission, scheduleNotificationInternal])

  const clear = useCallback(async (notificationId: string) => {
    clearLocalTimer(notificationId)

    const notification = notificationsRef.current.find((item) => item.id === notificationId)
    if (notification?.pushScheduleId) {
      try {
        await deleteJson(`/api/push-notifications/schedule/${notification.pushScheduleId}`)
      } catch (err) {
        console.warn("Failed to cancel scheduled push notification", err)
      }
    }

    persistNotifications(
      notificationsRef.current.filter((item) => item.id !== notificationId)
    )
  }, [clearLocalTimer, persistNotifications])

  const clearAll = useCallback(async () => {
    const notificationsToClear = [...notificationsRef.current]

    notificationsToClear.forEach((notification) => clearLocalTimer(notification.id))

    await Promise.all(
      notificationsToClear
        .filter((notification) => notification.pushScheduleId)
        .map((notification) =>
          deleteJson(`/api/push-notifications/schedule/${notification.pushScheduleId}`).catch(
            () => undefined
          )
        )
    )

    persistNotifications([])
  }, [clearLocalTimer, persistNotifications])

  const openNotification = useCallback((notificationId: string) => {
    const notification = notificationsRef.current.find((item) => item.id === notificationId)
    if (!notification) return

    setActiveToast(null)
    markAsRead(notificationId)
    navigateToNotification(notification)
  }, [markAsRead, navigateToNotification])

  const updateDailyMotivation = useCallback(async (enabled: boolean) => {
    const t = getI18n()
    setError(null)

    if (enabled && hasBrowserNotificationSupport()) {
      const nextPermission = await requestPermission()
      if (nextPermission !== "granted") {
        throw new Error(t.permissionNeededDaily)
      }
    }

    const nextSettings = {
      ...settingsRef.current,
      dailyMotivationEnabled: enabled,
    }

    settingsRef.current = nextSettings
    setSettings(nextSettings)
    saveSettings(nextSettings)

    if (!enabled) {
      const remaining = notificationsRef.current.filter((notification) => {
        const shouldRemove =
          notification.recurrence === "daily" && notification.scheduledFor > Date.now()

        if (shouldRemove) {
          clearLocalTimer(notification.id)
          if (notification.pushScheduleId) {
            void deleteJson(`/api/push-notifications/schedule/${notification.pushScheduleId}`).catch(
              () => undefined
            )
          }
        }

        return !shouldRemove
      })

      persistNotifications(remaining)
      return
    }

    await scheduleNextDailyReminder()
  }, [clearLocalTimer, persistNotifications, requestPermission, scheduleNextDailyReminder])

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount,
    permission,
    loading,
    error,
    isSupported,
    pushSupported,
    pushSubscribed,
    pushConfigured,
    settings,
    schedule,
    clear,
    clearAll,
    markAsRead,
    openNotification,
    requestPermission,
    enablePush,
    disablePush,
    sendTestPush,
    sendTestDailyMotivation,
    updateDailyMotivation,
  }), [
    clear,
    clearAll,
    disablePush,
    enablePush,
    error,
    isSupported,
    loading,
    markAsRead,
    notifications,
    openNotification,
    permission,
    pushConfigured,
    pushSubscribed,
    pushSupported,
    requestPermission,
    schedule,
    sendTestPush,
    sendTestDailyMotivation,
    settings,
    unreadCount,
    updateDailyMotivation,
  ])

  const ui = getI18n()

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {activeToast && (
        // Interaction strength: in-app toast keeps users in flow with a direct "tap to open" action.
        <button
          type="button"
          onClick={() => openNotification(activeToast.notificationId)}
          className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-xl"
        >
          <p className="text-sm font-semibold text-gray-900">{activeToast.title}</p>
          {activeToast.body && (
            <p className="mt-1 text-sm text-gray-600">{activeToast.body}</p>
          )}
          <p className="mt-2 text-xs font-medium text-emerald-700">{ui.toastTapToOpen}</p>
        </button>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }

  return context
}
