import { Hono } from 'hono'
import { collection, getDocs } from 'firebase/firestore'
import type { CloudflareBindings, CalendarEvent, GanttItem } from '../types'
import { initFirebase } from '../config/firebase'

const dashboard = new Hono<{ Bindings: CloudflareBindings }>()

dashboard.get('/calendar', async (c) => {
  const db = initFirebase(c.env)
  const events: CalendarEvent[] = []
  
  const tasksSnapshot = await getDocs(collection(db, 'tasks'))
  tasksSnapshot.docs.forEach(doc => {
    const task = { id: doc.id, ...doc.data() } as any
    if (task.dueDate) {
      events.push({
        id: task.id,
        title: task.title,
        start: task.startDate || task.createdAt.toISOString(),
        end: task.dueDate,
        type: 'task',
        status: task.status,
        description: task.description,
        color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'
      })
    }
  })
  
  const meetingsSnapshot = await getDocs(collection(db, 'meetings'))
  meetingsSnapshot.docs.forEach(doc => {
    const meeting = { id: doc.id, ...doc.data() } as any
    events.push({
      id: meeting.id,
      title: meeting.title,
      start: meeting.startTime,
      end: meeting.endTime,
      type: 'meeting',
      status: meeting.status,
      description: meeting.description,
      color: '#3b82f6'
    })
  })
  
  const remindersSnapshot = await getDocs(collection(db, 'reminders'))
  remindersSnapshot.docs.forEach(doc => {
    const reminder = { id: doc.id, ...doc.data() } as any
    events.push({
      id: reminder.id,
      title: reminder.title,
      start: reminder.reminderTime,
      end: reminder.reminderTime,
      type: 'reminder',
      status: reminder.isCompleted ? 'completed' : 'pending',
      description: reminder.description,
      color: '#8b5cf6'
    })
  })
  
  return c.json(events)
})

dashboard.get('/gantt', async (c) => {
  const db = initFirebase(c.env)
  const ganttItems: GanttItem[] = []
  
  const tasksSnapshot = await getDocs(collection(db, 'tasks'))
  tasksSnapshot.docs.forEach(doc => {
    const task = { id: doc.id, ...doc.data() } as any
    if (task.startDate && task.dueDate) {
      ganttItems.push({
        id: task.id,
        title: task.title,
        start: task.startDate,
        end: task.dueDate,
        progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
        type: 'task',
        status: task.status,
        priority: task.priority
      })
    }
  })
  
  const meetingsSnapshot = await getDocs(collection(db, 'meetings'))
  meetingsSnapshot.docs.forEach(doc => {
    const meeting = { id: doc.id, ...doc.data() } as any
    ganttItems.push({
      id: meeting.id,
      title: meeting.title,
      start: meeting.startTime,
      end: meeting.endTime,
      progress: meeting.status === 'completed' ? 100 : meeting.status === 'ongoing' ? 50 : 0,
      type: 'meeting',
      status: meeting.status,
      priority: 'medium'
    })
  })
  
  return c.json(ganttItems)
})

dashboard.get('/overview', async (c) => {
  const db = initFirebase(c.env)
  
  const [tasksSnapshot, meetingsSnapshot, remindersSnapshot] = await Promise.all([
    getDocs(collection(db, 'tasks')),
    getDocs(collection(db, 'meetings')),
    getDocs(collection(db, 'reminders'))
  ])
  
  const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  const meetings = meetingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  const reminders = remindersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  const overview = {
    tasks: {
      total: tasks.length,
      completed: tasks.filter((t: any) => t.status === 'completed').length,
      inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
      todo: tasks.filter((t: any) => t.status === 'todo').length,
      highPriority: tasks.filter((t: any) => t.priority === 'high').length
    },
    meetings: {
      total: meetings.length,
      today: meetings.filter((m: any) => {
        const today = new Date().toISOString().split('T')[0]
        return m.startTime?.startsWith(today)
      }).length,
      upcoming: meetings.filter((m: any) => m.status === 'scheduled').length,
      completed: meetings.filter((m: any) => m.status === 'completed').length
    },
    reminders: {
      total: reminders.length,
      pending: reminders.filter((r: any) => !r.isCompleted).length,
      completed: reminders.filter((r: any) => r.isCompleted).length,
      overdue: reminders.filter((r: any) => {
        return !r.isCompleted && new Date(r.reminderTime) < new Date()
      }).length
    }
  }
  
  return c.json(overview)
})

export default dashboard
