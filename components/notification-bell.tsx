"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, X, Check } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const { notifications, unreadCount, schedule, clear, clearAll, loading, error, isSupported } =
    useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"schedule" | "history">("schedule")
  const [scheduling, setScheduling] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null)
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

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

      // Show confirmation
      setConfirmMessage(`✓ Reminder set for ${interval.label}`)
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmMessage(null)
        setIsOpen(false)
      }, 3000)
    } catch (err) {
      console.error("Failed to schedule reminder:", err)
      setConfirmMessage("✗ Failed to set reminder. Please try again.")
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current)
      confirmTimeoutRef.current = setTimeout(() => {
        setConfirmMessage(null)
      }, 3000)
    } finally {
      setScheduling(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors",
            className
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2",
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
              "flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 relative",
              activeTab === "history"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            History
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 text-xs font-bold text-red-500">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
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
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Set a check-in reminder</h3>
        <p className="text-xs text-gray-600">
          Get notified to take a moment and check in with yourself
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {confirmMessage && (
        <div
          className={cn(
            "rounded-lg p-3 text-xs font-medium transition-all",
            confirmMessage.startsWith("✓")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
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
              "w-full px-4 py-3 rounded-lg border-2 transition-all text-left",
              "hover:border-green-400 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed",
              "border-gray-200 hover:border-green-400"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{interval.label}</span>
              <span className="text-xs text-gray-500">
                {loading ? "..." : "→"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 mt-4">
        💡 <span className="font-medium">Tip:</span> You'll receive a browser notification at the
        set time. Click it to go directly to the check-in screen!
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
  onClear: (id: string) => void
  onClearAll: () => void
}

function HistoryTab({ notifications, onClear, onClearAll }: HistoryTabProps) {
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notification History</h3>
          <p className="text-xs text-gray-600">
            {sortedNotifications.length === 0 ? "No reminders set yet" : `${sortedNotifications.length} reminder${sortedNotifications.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {sortedNotifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No reminders yet. Schedule one above!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                notification.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-green-50 border-green-200"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
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
                  onClick={() => onClear(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
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
