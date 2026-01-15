'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  try {
    const cookieStore = await cookies()

    // Clear custom auth cookies
    cookieStore.delete('auth-token')
    cookieStore.delete('refresh-token')

    // Clear NextAuth session cookies
    cookieStore.delete('next-auth.session-token')
    cookieStore.delete('next-auth.csrf-token')
    cookieStore.delete('next-auth.callback-url')
    cookieStore.delete('__Secure-next-auth.session-token')
    cookieStore.delete('__Secure-next-auth.csrf-token')
    cookieStore.delete('__Secure-next-auth.callback-url')

    return {
      success: true,
      message: "Logged out successfully"
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      error: "An error occurred during logout"
    }
  }
}

export async function logoutAndRedirect() {
  await logout()
  redirect('/auth/login')
}