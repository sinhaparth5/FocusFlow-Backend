import { Hono } from 'hono'
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore'
import type { CloudflareBindings, Meeting } from '../types'
import { initFirebase } from '../config/firebase'
import { initGoogleAuth } from '../config/google'
import { createCalendarEvent } from '../utils/calendar'

const meetings = new Hono<{ Bindings: CloudflareBindings }>()

meetings.get('/', async (c) => {
  const db = initFirebase(c.env)
  const snapshot = await getDocs(collection(db, 'meetings'))
  const meetingsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return c.json(meetingsList)
})

meetings.post('/', async (c) => {
  const db = initFirebase(c.env)
  const oauth2Client = initGoogleAuth(c.env)
  const meeting: Meeting = await c.req.json()
  
  const docRef = await addDoc(collection(db, 'meetings'), {
    ...meeting,
    createdAt: new Date(),
    status: 'scheduled'
  })
  
  try {
    await createCalendarEvent(oauth2Client, meeting)
  } catch (error) {
    console.error('Calendar sync failed:', error)
  }
  
  return c.json({ id: docRef.id, message: 'Meeting created' })
})

meetings.patch('/:id/status', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  const { status } = await c.req.json()
  await updateDoc(doc(db, 'meetings', id), { status })
  return c.json({ message: 'Meeting status updated' })
})

export default meetings