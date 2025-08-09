export interface CloudflareBindings {
  FIREBASE_API_KEY: string
  FIREBASE_AUTH_DOMAIN: string
  FIREBASE_PROJECT_ID: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string
  JWT_SECRET: string
}

export interface UserSession {
  userId: string
  email: string
  name: string
  accessToken: string
  refreshToken?: string
}

export type Task = {
  id?: string
  userId: string
  title: string
  description?: string
  completed: boolean
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' |'high'
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  googleEventId?: string
  createdAt: Date
  updatedAt?: Date
}

export type Meeting = {
  id?: string
  userId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees?: string[]
  location?: string
  meetingType: 'call' | 'in-person' | 'video'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  googleEventId?: string
  createdAt?: Date
}

export type Reminder = {
  id?: string
  userId: string
  title: string
  description?: string
  reminderTime: string
  reminderType: 'task' | 'meeting' | 'personal'
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high'
  googleEventId?: string
  createdAt?: Date
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  type: 'task' | 'meeting' | 'reminder'
  status: string
  color?: string
  description?: string
}

export type GanttItem = {
  id: string
  title: string
  start: string
  end: string
  progress: number
  type: 'task' | 'meeting'
  status: string
  dependencies?: string[]
  priority: string
}
