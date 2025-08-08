import { Hono } from 'hono'
import type { CloudflareBindings } from '../types'
import { initGoogleAuth } from '../config/google'

const auth = new Hono<{ Bindings: CloudflareBindings }>()

auth.get('/google', (c) => {
  const oauth2Client = initGoogleAuth(c.env)
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar']
  })
  return c.redirect(url)
})

auth.get('/callback', async (c) => {
  const oauth2Client = initGoogleAuth(c.env)
  const code = c.req.query('code')
  
  if (!code) {
    return c.json({ error: 'No authorization code provided' }, 400)
  }
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    return c.json({ 
      message: 'Google Calendar authenticated successfully',
      success: true 
    })
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Authentication failed' }, 400)
  }
})

auth.get('/debug', (c) => {
  const oauth2Client = initGoogleAuth(c.env)
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar']
  })
  
  return c.json({
    clientId: c.env.GOOGLE_CLIENT_ID,
    redirectUri: c.env.GOOGLE_REDIRECT_URI,
    generatedUrl: url,
    parsedRedirect: new URL(url).searchParams.get('redirect_uri')
  })
})

export default auth