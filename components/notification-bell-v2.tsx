"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Check, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const CHECK_IN_INTERVALS = [
  { label: "5 minutes", value: "5", ms: 5 * 60 * 1000 },
  { label: "10 minutes", value: "10", ms: 10 * 60 * 1000 },
  { label: "30 minutes", value: "30", ms: 30 * 60 * 1000 },
  { label: "1 hour", value: "1h", ms: 60 * 60 * 1000 },
]

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { notifications, unreadCount, schedule, clear, clearAll, openNotification, error } =
    useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"schedule" | "history">("schedule")
  const [scheduling, setScheduling] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current)
    }
  }, [])

  const handleScheduleReminder = async (interval: { label: string; value: string; ms: number }) => {
    setScheduling(true)

    try {
      await schedule(interval.ms, "Time to check in!", {
        body: "Let's take a moment to reflect and check in with yourself.",
        actionUrl: "/grounding",
      })

      setConfirmMessage(`Reminder set for ${interval.label}`)
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmMessage(null)
        setIsOpen(false)
      }, 3000)
    } catch (scheduleError) {
      console.error("Failed to schedule reminder:", scheduleError)
      setConfirmMessage("Failed to set reminder. Please try again.")
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => setConfirmMessage(null), 3000)
    } finally {
      setScheduling(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors z-50",
            className
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="m-2 w-[90vw] max-h-[70vh] p-0 sm:w-96 md:w-80"
        sideOffset={8}
      >
        <div className="sticky top-0 z-10 flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "schedule"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "relative flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "history"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            History
            {unreadCount > 0 && (
              <span className="absolute right-2 top-1 text-xs font-bold text-red-500">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="max-h-[calc(70vh-120px)] overflow-y-auto p-4">
          {activeTab === "schedule" ? (
            <ScheduleTab
              intervals={CHECK_IN_INTERVALS}
              onSchedule={handleScheduleReminder}
              loading={scheduling}
              confirmMessage={confirmMessage}
              error={error}
            />
          ) : (
            <HistoryTab
              notifications={notifications}
              onClear={clear}
              onClearAll={clearAll}
              onOpen={(notificationId) => {
                setIsOpen(false)
                openNotification(notificationId)
              }}
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ScheduleTabProps {
  intervals: Array<{ label: string; value: string; ms: number }>
  onSchedule: (interval: { label: string; value: string; ms: number }) => void
  loading: boolean
  confirmMessage: string | null
  error: string | null
}

function ScheduleTab({ intervals, onSchedule, loading, confirmMessage, error }: ScheduleTabProps) {
  const isSuccess = Boolean(confirmMessage && !confirmMessage.startsWith("Failed"))

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Set a check-in reminder</h3>
        <p className="text-xs text-gray-600">Get notified to check in with yourself.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {confirmMessage && (
        <div
          className={cn(
            "rounded-lg p-2 text-xs font-medium transition-all",
            isSuccess
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          )}
        >
          {confirmMessage}
        </div>
      )}

      <div className="space-y-2">
        {intervals.map((interval) => (
          <button
            key={interval.value}
            onClick={() => onSchedule(interval)}
            disabled={loading}
            className={cn(
              "w-full rounded-lg border-2 px-4 py-3 text-left transition-all",
              "hover:border-green-400 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50",
              "border-gray-200 text-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{interval.label}</span>
              <span className="text-sm text-gray-500">{loading ? "..." : "->"}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-700">
        <span className="font-medium">Tip:</span> You will get a notification at the scheduled time.
      </div>
    </div>
  )
}

interface HistoryTabProps {
  notifications: Array<{
    id: string
    title: string
    timestamp: number
    scheduledFor: number
    read: boolean
    type: string
  }>
  onClear: (id: string) => void | Promise<void>
  onClearAll: () => void | Promise<void>
  onOpen: (id: string) => void
}

function HistoryTab({ notifications, onClear, onClearAll, onOpen }: HistoryTabProps) {
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Notification History</h3>
          <p className="text-xs text-gray-600">
            {sortedNotifications.length === 0
              ? "No reminders set yet"
              : `${sortedNotifications.length} reminder${sortedNotifications.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {sortedNotifications.length > 0 && (
          <button
            onClick={() => void onClearAll()}
            className="text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="py-4 text-center text-gray-500">
          <Bell className="mx-auto mb-2 h-6 w-6 opacity-50" />
          <p className="text-sm">No reminders yet. Schedule one above.</p>
        </div>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "cursor-pointer rounded-lg border p-3 text-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/60",
                notification.read ? "border-gray-200 bg-gray-50" : "border-green-200 bg-green-50"
              )}
              onClick={() => onOpen(notification.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-gray-900">{notification.title}</p>
                    {!notification.read && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <Check className="h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    void onClear(notification.id)
                  }}
                  className="mt-1 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label="Remove notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
