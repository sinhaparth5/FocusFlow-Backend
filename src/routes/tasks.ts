import { Hono } from 'hono'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { CloudflareBindings, Task } from '../types'
import { initFirebase } from '../config/firebase'

const tasks = new Hono<{ Bindings: CloudflareBindings }>()

tasks.get('/', async (c) => {
  const db = initFirebase(c.env)
  const snapshot = await getDocs(collection(db, 'tasks'))
  const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return c.json(tasksList)
})

tasks.post('/', async (c) => {
  const db = initFirebase(c.env)
  const task: Task = await c.req.json()
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...task,
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false,
    status: 'todo'
  })
  return c.json({ id: docRef.id, message: 'Task created' })
})

// Mark task as started
tasks.patch('/:id/start', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  await updateDoc(doc(db, 'tasks', id), {
    status: 'in-progress',
    updatedAt: new Date()
  })
  return c.json({ message: 'Task started' })
})

// Mark task as completed
tasks.patch('/:id/complete', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  await updateDoc(doc(db, 'tasks', id), {
    status: 'completed',
    completed: true,
    updatedAt: new Date()
  })
  return c.json({ message: 'Task completed' })
})

tasks.put('/:id', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  const updates = await c.req.json()
  await updateDoc(doc(db, 'tasks', id), updates)
  return c.json({ message: 'Task updated' })
})

tasks.delete('/:id', async (c) => {
  const db = initFirebase(c.env)
  const id = c.req.param('id')
  await deleteDoc(doc(db, 'tasks', id))
  return c.json({ message: 'Task deleted' })
})

export default tasks
