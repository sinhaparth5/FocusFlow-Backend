import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { CloudflareBindings } from './types'
import tasks from './routes/tasks'
import meetings from './routes/meetings'
import reminders from './routes/reminders'
import dashboard from './routes/dashboard'
import auth from './routes/auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', cors())

app.route('/tasks', tasks)
app.route('/meetings', meetings)
app.route('/reminders', reminders)
app.route('/dashboard', dashboard)
app.route('/auth', auth)

app.get('/', (c) => {
  return c.json({ 
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      tasks: {
        list: 'GET /tasks',
        create: 'POST /tasks',
        update: 'PUT /tasks/:id',
        delete: 'DELETE /tasks/:id',
        start: 'PATCH /tasks/:id/start',
        complete: 'PATCH /tasks/:id/complete'
      },
      meetings: {
        list: 'GET /meetings',
        create: 'POST /meetings',
        updateStatus: 'PATCH /meetings/:id/status'
      },
      reminders: {
        list: 'GET /reminders',
        create: 'POST /reminders',
        complete: 'PATCH /reminders/:id/complete'
      },
      dashboard: {
        calendar: 'GET /dashboard/calendar',
        gantt: 'GET /dashboard/gantt',
        overview: 'GET /dashboard/overview'
      },
      auth: {
        google: 'GET /auth/google',
        callback: 'GET /auth/callback'
      }
    }
  })
})

export default app