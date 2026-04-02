import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/actions/register'
import { StatusCodes } from 'http-status-codes'
import { rateLimit } from '@/lib/rate-limit'

type RegisterResponse = {
  error?: string;
  success?: boolean;
  message?: string;
  userId?: string;
}

/**
 * @api {post} /api/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 * 
 * @apiBody {String} name User's full name
 * @apiBody {String} email User's email address
 * @apiBody {String} password User's password
 * @apiBody {String} phoneNumber User's phone number
 * @apiBody {String} countryCode Country calling code
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "message": "Registration successful! Please check your email for the verification code.",
 *       "userId": "clm123abc..."
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email already exists"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Failed to send verification email: SMTP connection failed. Please try again."
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
    const { success: allowed, retryAfter } = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: StatusCodes.TOO_MANY_REQUESTS, headers: { 'Retry-After': String(retryAfter) } }
        )
    }

    try {
        const { cfTurnstileToken, ...body } = await request.json()

        // Verify Cloudflare Turnstile token
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: cfTurnstileToken,
            }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
            return NextResponse.json(
                { error: 'CAPTCHA verification failed. Please try again.' },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        const result = await register(body) as RegisterResponse

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: StatusCodes.BAD_REQUEST }
            )
        }

        return NextResponse.json(
            { 
                success: result.success,
                message: result.message,
                userId: result.userId
            },
            { status: StatusCodes.CREATED }
        )
    } catch (error) {
        console.error('API Route Error:', error)
        
        // Extract meaningful error message
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Internal Server Error'
            
        return NextResponse.json(
            { error: errorMessage },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
    }
}