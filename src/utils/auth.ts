import { sign, verify } from '@tsndr/cloudflare-worker-jwt'
import type { CloudflareBindings, UserSession } from '../types'

export const createJWT = async (userSession: UserSession, secret: string): Promise<string> => {
  return await sign({
    sub: userSession.userId,
    email: userSession.email,
    name: userSession.name,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }, secret)
}

export const verifyJWT = async (token: string, secret: string): Promise<UserSession | null> => {
  try {
    const isValid = await verify(token, secret)
    if (!isValid) return null

    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      accessToken: ''
    }
  } catch {
    return null
  }
}

export const extractUser = async (c: any): Promise<UserSession | null> => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  return await verifyJWT(token, c.env.JWT_SECRET)
}
