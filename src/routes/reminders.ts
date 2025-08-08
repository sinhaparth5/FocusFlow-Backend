import { Hono } from 'hono'
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'
import type { CloudflareBindings, Reminder } from '../types'
import { initFirebase } from '../config/firebase'
import { initGoogleAuth } from '../config/google'
import { createCalendarReminder } from '../utils/calendar'

const reminders = new Hono<{ Bindings: CloudflareBindings }>()

reminders.get('/', async (c) => {
  const db = initFirebase(c.env)
  const snapshot = await getDocs(collection(db, 'reminders'))
  const remindersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return c.json(remindersList)
})

reminders.post('/', async (c) => {
  const db = initFirebase(c.env)
  const oauth2Client = initGoogleAuth(c.env)
  const reminder: Reminder = await c.req.json()
  
  const docRef = await addDoc(collection(db, 'reminders'), {
    ...reminder,
    createdAt: new Date(),
    isCompleted: false
  })
  
  try {
    await createCalendarReminder(oauth2Client, reminder)
  } catch (error) {
    console.error('Calendar sync failed:', error)
  }
  
  return c.json({ id: docRef.id, message: 'Reminder created' })
})

// Mark reminder as completed
reminders.patch('/:id/complete', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  await updateDoc(doc(db, 'reminders', id), { isCompleted: true })
  return c.json({ message: 'Reminder completed' })
})

export default reminders