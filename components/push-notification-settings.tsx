"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Push Notification Settings Component
 * Allows users to enable/disable push notifications
 * Shows status and test functionality
 */
export function PushNotificationSettings() {
  const { supported, subscribed, loading, error, subscribe, unsubscribe, sendTest } =
    usePushNotifications()
  const [testSending, setTestSending] = useState(false)
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  if (!supported) {
    return null
  }

  const handleTogglePush = async () => {
    if (subscribed) {
      await unsubscribe()
      setTestMessage(null)
    } else {
      await subscribe()
    }
  }

  const handleSendTest = async () => {
    setTestSending(true)
    const success = await sendTest()
    setTestMessage(
      success
        ? "✓ Test notification sent! Check your device."
        : "✗ Failed to send test notification"
    )
    setTestSending(false)
    setTimeout(() => setTestMessage(null), 5000)
  }

  return (
    <div className="w-full">
      {/* Push Settings Panel */}
      <div className="border-t pt-4 mt-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-3 hovxer:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Push Notifications</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {subscribed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {!subscribed && (
              <AlertCircle className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 ml-2">
              {showSettings ? "▼" : "▶"}
            </span>
          </div>
        </button>

        {/* Expanded Settings */}
        {showSettings && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
            {/* Status */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Status</p>
              <div className={cn(
                "p-2 rounded text-xs",
                subscribed
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              )}>
                {subscribed
                  ? "✓ Push notifications enabled - receive alerts even when app is closed"
                  : "⚠ Push notifications disabled - enable to receive background alerts"}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2 bg-red-100 text-red-800 text-xs rounded">
                ✗ {error}
              </div>
            )}

            {/* Test Message */}
            {testMessage && (
              <div className={cn(
                "p-2 rounded text-xs",
                testMessage.startsWith("✓")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}>
                {testMessage}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleTogglePush}
                disabled={loading}
                variant={subscribed ? "destructive" : "default"}
                size="sm"
                className="flex-1 text-xs"
              >
                {loading ? (
                  <>
                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : subscribed ? (
                  "Disable Push"
                ) : (
                  "Enable Push"
                )}
              </Button>

              {subscribed && (
                <Button
                  onClick={handleSendTest}
                  disabled={testSending}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  {testSending ? (
                    <>
                      <Loader className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Test"
                  )}
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-xs text-blue-800">
                <span className="font-medium">💡 Tip:</span> Push notifications will send even if you're browsing
                other apps! You'll receive reminders to check in with yourself.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
