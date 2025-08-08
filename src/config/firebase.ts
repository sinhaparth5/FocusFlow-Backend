import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import type { CloudflareBindings } from '../types'

export const initFirebase = (env: CloudflareBindings) => {
  const app = initializeApp({
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
  })
  return getFirestore(app)
}
