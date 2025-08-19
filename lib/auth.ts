"use server"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const secretKey = process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey)
const COOKIE_NAME = "session"

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1hr") // Session expires in 1 hour
    .sign(key)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Failed to verify session:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export interface User {
  id: number // Changed to number for consistency with actions.tsx
  name: string
  email: string
  role: "Admin" | "User" | "Viewer" // Updated roles
  status: "active" | "inactive"
  designation: string
  is_password_changed: boolean
}

export interface Session {
  userId: number // Changed to number
  email: string
  role: string
  isPasswordChanged: boolean // Added
  token: string // This field is not actually used in the session payload, can be removed
  expires: number
  createdAt: number
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; flow: string }>()

// Store sessions temporarily (in production, use Redis or database)
const sessionStore = new Map<string, Session>() // This is not used for actual session management with cookies

export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function generateToken(): Promise<string> {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

export async function storeOTP(email: string, otp: string, flow: string): Promise<void> {
  const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStore.set(email, { otp, expires, flow })
}

export async function verifyOTP(email: string, otp: string, flow: string): Promise<boolean> {
  const storedOTP = otpStore.get(email)
  if (!storedOTP) {
    return false
  }
  if (storedOTP.expires < Date.now()) {
    otpStore.delete(email)
    return false
  }
  if (storedOTP.otp !== otp || storedOTP.flow !== flow) {
    return false
  }
  // Remove OTP after successful verification
  otpStore.delete(email)
  return true
}

export async function createSession(userId: number, email: string, role: string, isPasswordChanged: boolean) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await encrypt({ userId, email, role, isPasswordChanged, exp: expiresAt.getTime() / 1000 })
  const responseCookies = await cookies();
  responseCookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const session = (await cookies()).get(COOKIE_NAME)?.value
  if (!session) return null
  const payload = await decrypt(session)
  return payload
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME)
}

export async function getSessionUser() {
  const session = await verifySession()
  if (!session) {
    redirect("/login")
  }
  return session
}

// Add a function to check if session exists without verification delays
export async function hasValidSession(): Promise<boolean> {
  try {
    const session = (await cookies()).get(COOKIE_NAME)?.value
    if (!session) {
      return false
    }
    const payload = await decrypt(session)
    return payload !== null && typeof payload.exp === "number" && payload.exp * 1000 > Date.now() // Check expiration
  } catch (error) {
    return false
  }
}
