/**
 * Example: Notification Feature in Action
 * 
 * This is a complete example page showing how to integrate
 * the notification feature into a real page
 * 
 * You can copy this pattern to add reminders to any page
 */

"use client"

import { useState } from "react"
import { Bell, CheckCircle2, Clock, X } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"

export default function NotificationExamplePage() {
  const { schedule, loading, error, permission, requestPermission } = useNotifications()
  const [scheduled, setScheduled] = useState(false)

  const handleQuickReminder = async (minutes: number) => {
    try {
      setScheduled(false)
      await schedule(minutes * 60 * 1000, "Time to check in!", {
        body: `It's been ${minutes} minutes. How are you feeling?`,
        actionUrl: "/grounding",
      })
      setScheduled(true)
    } catch (err) {
      console.error("Failed to schedule:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Check-In Reminders
          </h1>
          <p className="text-lg text-gray-600">
            Never forget to take a moment and check in with yourself
          </p>
        </div>

        {/* Permission Status */}
        <div className="mb-6 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Notification Status</h3>
              <p className="text-sm text-blue-700">
                {permission === "granted" && "✓ Notifications enabled - You're all set!"}
                {permission === "denied" && "✗ Notifications blocked - Check your browser settings"}
                {permission === "default" && "Notifications not yet enabled"}
              </p>
              {permission !== "granted" && (
                <Button
                  onClick={requestPermission}
                  size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Enable Notifications
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reminder Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Set a Quick Reminder
          </h2>
          <p className="text-gray-600 mb-6">
            Choose when you'd like to be reminded to take a check-in moment:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[5, 10, 30, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handleQuickReminder(minutes)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-green-400 hover:bg-green-50 border-gray-200"
                }`}
              >
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">
                  {minutes === 60 ? "1h" : `${minutes}m`}
                </div>
                <div className="text-xs text-gray-500">
                  {minutes === 5 && "Quick check"}
                  {minutes === 10 && "Short break"}
                  {minutes === 30 && "Afternoon"}
                  {minutes === 60 && "Evening"}
                </div>
              </button>
            ))}
          </div>

          {/* Success Message */}
          {scheduled && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Reminder scheduled!</p>
                <p className="text-sm text-green-700">
                  You'll get a notification at the scheduled time
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <X className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How Check-In Reminders Work
          </h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Set a Reminder",
                description:
                  "Choose how long until you want to be reminded (5 min, 10 min, 30 min, or 1 hour)",
              },
              {
                step: 2,
                title: "Get Permission",
                description:
                  "Your browser will ask for permission to send notifications (one-time only)",
              },
              {
                step: 3,
                title: "Receive Notification",
                description:
                  "When the time is up, you'll get a notification on your device",
              },
              {
                step: 4,
                title: "Check In",
                description:
                  "Click the notification to go directly to our grounding techniques page",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                    <span className="text-green-800 font-semibold">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 rounded-lg shadow-lg p-8 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Tips for Best Results</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Enable notifications to get reminders even if you minimize the app</li>
            <li>✓ Set reminders at times when you need support the most</li>
            <li>✓ Try combining reminders with grounding techniques</li>
            <li>✓ You can set multiple reminders at once</li>
            <li>✓ Check the notification history (click the bell icon) to see all reminders</li>
          </ul>
        </div>

        {/* Developer Example Section */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <h3 className="text-white font-bold mb-4">Code Example</h3>
          <pre className="text-gray-300 text-sm">
{`import { useNotifications } from "@/hooks/use-notifications"

export function MyComponent() {
  const { schedule } = useNotifications()

  const handleSchedule = async () => {
    await schedule(5 * 60 * 1000, "Time to check in!", {
      body: "How are you feeling?",
      actionUrl: "/grounding"
    })
  }

  return (
    <button onClick={handleSchedule}>
      Remind me in 5 minutes
    </button>
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
