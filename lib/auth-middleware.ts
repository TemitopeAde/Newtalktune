// lib/auth-middleware.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'

export async function getAuthenticatedUser() {
  // First try NextAuth session
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        role: true,
        createdAt: true
      }
    })

    if (user) {
      return user
    }
  }

  // Fallback to JWT token
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  // Fetch user from database to ensure they still exist and are verified
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      role: true,
      createdAt: true
    }
  })

  if (!user || !user.isVerified) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

// For API routes
export async function authenticateRequest(request: NextRequest) {
  // First try NextAuth session
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          isVerified: true,
          role: true
        }
      })

      if (user) {
        return user
      }
    }
  } catch (error) {
    console.warn('NextAuth session check failed:', error)
  }

  // Fallback to JWT token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
      role: true
    }
  })

  return user
}