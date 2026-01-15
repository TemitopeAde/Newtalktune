import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'

/**
 * @api {post} /api/auth/logout Logout User
 * @apiName Logout
 * @apiGroup Auth
 * @apiDescription Logout the current user by clearing the authentication token
 * 
 * @apiHeader {String} Cookie Authentication cookie with 'auth-token'
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Logged out successfully"
 *     }
 * 
 * @apiErrorExample {json} Internal Server Error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "An error occurred during logout"
 *     }
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()

        // Clear custom auth token cookie
        cookieStore.delete('auth-token')
        cookieStore.delete('refresh-token')

        // Clear NextAuth session cookies (for OAuth users)
        cookieStore.delete('next-auth.session-token')
        cookieStore.delete('next-auth.csrf-token')
        cookieStore.delete('next-auth.callback-url')
        cookieStore.delete('__Secure-next-auth.session-token')
        cookieStore.delete('__Secure-next-auth.csrf-token')
        cookieStore.delete('__Secure-next-auth.callback-url')

        return NextResponse.json(
            {
                success: true,
                message: "Logged out successfully"
            },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Logout API Route Error:', error)

        const errorMessage = error instanceof Error
            ? error.message
            : 'An error occurred during logout'

        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}