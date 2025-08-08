export interface CloudflareBindings {
  FIREBASE_API_KEY: string
  FIREBASE_AUTH_DOMAIN: string
  FIREBASE_PROJECT_ID: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string
}

export type Task = {
  id?: string
  title: string
  description?: string
  completed: boolean
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' |'high'
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt?: Date
}

export type Meeting = {
  id?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  attendees?: string[]
  location?: string
  meetingType: 'call' | 'in-person' | 'video'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt?: Date
}

export type Reminder = {
  id?: string
  title: string
  description?: string
  reminderTime: string
  reminderType: 'task' | 'meeting' | 'personal'
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high'
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
