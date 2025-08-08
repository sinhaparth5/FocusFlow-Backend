import { google } from 'googleapis'
import type { CloudflareBindings } from '../types'

export const initGoogleAuth = (env: CloudflareBindings) => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  )
}