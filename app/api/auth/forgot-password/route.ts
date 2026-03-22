import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { forgotPassword } from '@/actions/forgetPassword'
import { rateLimit } from '@/lib/rate-limit'

export type ForgotPasswordResponse = {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * @api {post} /api/auth/forgot-password Request password reset
 * @apiName ForgotPassword
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email address
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "If an account with that email exists, we've sent password reset instructions to your email address."
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Please enter a valid email address"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Failed to send password reset email. Please try again later."
 *     }
 * 
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal Server Error"
 *     }
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ??
               request.headers.get('x-real-ip') ?? 'unknown'
    const { success: allowed, retryAfter } = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: StatusCodes.TOO_MANY_REQUESTS, headers: { 'Retry-After': String(retryAfter) } }
        )
    }

    try {
        const body = await request.json()
        const result = await forgotPassword(body) as ForgotPasswordResponse

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        return NextResponse.json(
            { 
                success: result.success,
                message: result.message
            },
            { status: StatusCodes.OK }
        )
    } catch (error) {
        console.error('Forgot Password API Route Error:', error)
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}