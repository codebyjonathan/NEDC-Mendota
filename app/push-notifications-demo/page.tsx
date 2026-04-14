"use client"

import { useState } from "react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, CheckCircle, AlertCircle, Bell } from "lucide-react"

/**
 * Push Notifications Demo Page
 * Shows how push notifications work and allows testing
 * Access at: /push-notifications-demo
 */
export default function PushNotificationsDemo() {
  const { supported, subscribed, loading, error, subscribe, unsubscribe, sendTest, schedule } =
    usePushNotifications()
  const [selectedInterval, setSelectedInterval] = useState("5")
  const [scheduledMessage, setScheduledMessage] = useState<string | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const intervals = [
    { value: "5", label: "5 minutes" },
    { value: "10", label: "10 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
  ]

  const handleSchedule = async () => {
    setScheduleLoading(true)
    const intervalMs = selectedInterval === "1h" ? 60 * 60 * 1000 : parseInt(selectedInterval) * 60 * 1000

    const id = await schedule(intervalMs, `Check-in reminder in ${intervals.find(i => i.value === selectedInterval)?.label}`, {
      body: "Let's take a moment to reflect and check in with yourself.",
      actionUrl: "/grounding",
    })

    setScheduleLoading(false)
    setScheduledMessage(
      id
        ? `✓ Notification scheduled! You'll receive it in ${intervals.find(i => i.value === selectedInterval)?.label}`
        : "✗ Failed to schedule notification"
    )
    setTimeout(() => setScheduledMessage(null), 5000)
  }

  if (!supported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 sm:p-6">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Push Notifications Not Supported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your browser doesn't support push notifications. Try:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-sm text-gray-600">
              <li>Chrome, Firefox, Edge, or Opera (full support)</li>
              <li>Safari on macOS/iOS (limited support)</li>
              <li>A native mobile app for best experience</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Bell className="h-8 w-8 text-green-500" />
            Push Notifications Demo
          </h1>
          <p className="text-gray-600">
            Test push notifications that work even when Safe Space is closed
          </p>
        </div>

        {/* Status Card */}
        <Card className={subscribed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscribed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Subscribed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-700">Not Subscribed</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {subscribed
                ? "You'll receive push notifications even when Safe Space is closed!"
                : "Enable push notifications to receive background alerts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                Error: {error}
              </div>
            )}
            <Button
              onClick={subscribed ? unsubscribe : subscribe}
              disabled={loading}
              variant={subscribed ? "destructive" : "default"}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {subscribed ? "Disabling..." : "Enabling..."}
                </>
              ) : subscribed ? (
                "Disable Push Notifications"
              ) : (
                "Enable Push Notifications"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        {subscribed && (
          <>
            {/* Send Test Card */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">Send Test Notification</CardTitle>
                <CardDescription>
                  Receive an immediate test notification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={sendTest}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "📬 Send Test Notification"
                  )}
                </Button>
                <p className="text-xs text-gray-600 mt-3">
                  💡 You should see a notification appear even if Safe Space is not active
                </p>
              </CardContent>
            </Card>

            {/* Schedule Notification Card */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700">Schedule Notification</CardTitle>
                <CardDescription>
                  Get a reminder at a specific time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    When to notify
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {intervals.map((interval) => (
                      <button
                        key={interval.value}
                        onClick={() => setSelectedInterval(interval.value)}
                        className={`p-2 rounded border-2 transition-all text-sm font-medium ${
                          selectedInterval === interval.value
                            ? "border-purple-500 bg-purple-100 text-purple-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
                        }`}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>

                {scheduledMessage && (
                  <div className={`p-3 rounded text-sm ${
                    scheduledMessage.startsWith("✓")
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {scheduledMessage}
                  </div>
                )}

                <Button
                  onClick={handleSchedule}
                  disabled={scheduleLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {scheduleLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "⏰ Schedule Notification"
                  )}
                </Button>

                <p className="text-xs text-gray-600">
                  💡 Close the app and wait for your notification! You can even close your browser and you'll still receive it.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* How It Works */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>How Push Notifications Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="font-bold text-green-600 flex-shrink-0">1</div>
              <div>You enable push notifications in the app</div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-green-600 flex-shrink-0">2</div>
              <div>Your device registers with the notification service</div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-green-600 flex-shrink-0">3</div>
              <div>You schedule check-in reminders for specific times</div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-green-600 flex-shrink-0">4</div>
              <div>At the scheduled time, you receive a notification</div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-green-600 flex-shrink-0">5</div>
              <div>Clicking opens Safe Space to the grounding exercise</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
              <p className="font-medium text-blue-900 mb-1">✨ Key Benefit</p>
              <p>These notifications work even if you've closed Safe Space or your browser. Perfect for reminding you to check in!</p>
            </div>
          </CardContent>
        </Card>

        {/* Browser Support */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Browser Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { name: "Chrome", support: "✅" },
                { name: "Firefox", support: "✅" },
                { name: "Edge", support: "✅" },
                { name: "Opera", support: "✅" },
                { name: "Safari", support: "⚠️" },
                { name: "Mobile Safari", support: "⚠️" },
              ].map((browser) => (
                <div key={browser.name} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">{browser.support}</div>
                  <div className="text-gray-600">{browser.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
