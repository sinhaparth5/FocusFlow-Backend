import { google } from 'googleapis'
import type { Meeting, Reminder, Task } from '../types'

export const createTaskInCalendar = async (oauth2Client: any, task: Task) => {
  if (!task.dueDate) return null

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const event = await calendar.events.insert({
      requestBody: {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: task.startDate || new Date().toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: task.dueDate,
          timeZone: 'UTC'
        },
        colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '2'
      }
    })
    return event.data.id
  } catch (error) {
    console.error('Calendar task creation failed:', error)
    throw error
  }
}

export const createMeetingInCalendar = async (oauth2Client: any, meeting: Meeting) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: meeting.title,
        start: {
          dateTime: meeting.startTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: meeting.endTime,
          timeZone: 'UTC'
        },
        location: meeting.location,
        attendees: meeting.attendees?.map(email => ({ email })),
        colorId: '9'
      }
    })
    return event.data.id
  } catch (error) {
    console.error('Calendar error:', error)
    throw error
  }
}

export const createReminderInCalendar = async (oauth2Client: any, reminder: Reminder) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: reminder.title,
        start: {
          dateTime: reminder.reminderTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(new Date(reminder.reminderTime).getTime() + 15 * 60000).toISOString(),
          timeZone: 'UTC'
        },
        description: reminder.description,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
            { method: 'email', minutes: 30 }
          ]
        },
        colorId: '8'
      }
    })
    return event.data.id
  } catch (error) {
    console.error('Calendar error:', error)
    throw error
  }
}
