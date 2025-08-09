import { Hono } from 'hono'
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore'
import type { CloudflareBindings, UserSession } from '../types'
import { initFirebase } from '../config/firebase'
import { initGoogleAuth } from '../config/google'
import { createJWT, extractUser } from '../utils/auth'
import { google } from 'googleapis'

const auth = new Hono<{ Bindings: CloudflareBindings }>()

auth.get('/google', (c) => {
  const oauth2Client = initGoogleAuth(c.env)
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
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

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    const userData = userInfo.data
    if (!userData.email) {
      return c.json({ error: 'Unable to get user email' }, 400)
    }

    const db = initFirebase(c.env)
    const userSession: UserSession = {
      userId: userData.id!,
      email: userData.email,
      name: userData.name || 'User',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token
    }

    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('userId', '==', userData.id))
    const existingUser = await getDocs(userQuery)

    if (existingUser.empty) {
      await addDoc(usersRef, {
        ...userSession,
        createdAt: new Date(),
        lastLogin: new Date
      })
    } else {
      await updateDoc(existingUser.docs[0].ref, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        lastLogin: new Date()
      })
    }

    const jwtToken = await createJWT(userSession, c.env.JWT_SECRET)

    return c.json({
      message: 'Authentication successfully',
      token: jwtToken,
      user: {
        id: userSession.userId,
        email: userSession.email,
        name: userSession.email
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Authentication failed' }, 400)
  }
})

auth.get('/me', async (c) => {
  const user = await extractUser(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({
    id: user.userId,
    email: user.email,
    name: user.name
  })
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
