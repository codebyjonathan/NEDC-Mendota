export type NotificationType = "check-in" | "motivation"

export interface AppNotification {
  id: string
  title: string
  body?: string
  timestamp: number
  scheduledFor: number
  interval: number
  read: boolean
  type: NotificationType
  actionUrl?: string
  deliveredAt?: number
  pushScheduleId?: string | null
  recurrence?: "daily"
}

export interface NotificationSettings {
  dailyMotivationEnabled: boolean
  dailyMotivationHour: number
}

export interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  permission: NotificationPermission
}
