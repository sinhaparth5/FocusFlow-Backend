import { google } from 'googleapis'
import type { Meeting, Reminder } from '../types'

export const createCalendarEvent = async (oauth2Client: any, meeting: Meeting) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  
  try {
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: meeting.title,
        start: { dateTime: meeting.startTime },
        end: { dateTime: meeting.endTime },
        attendees: meeting.attendees?.map(email => ({ email }))
      }
    })
  } catch (error) {
    console.error('Calendar error:', error)
    throw error
  }
}

export const createCalendarReminder = async (oauth2Client: any, reminder: Reminder) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  
  try {
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: reminder.title,
        start: { dateTime: reminder.reminderTime },
        end: { dateTime: new Date(new Date(reminder.reminderTime).getTime() + 15 * 60000).toISOString() },
        description: reminder.description,
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 10 }]
        }
      }
    })
  } catch (error) {
    console.error('Calendar error:', error)
    throw error
  }
}