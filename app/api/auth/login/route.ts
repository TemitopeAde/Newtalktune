import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/actions/login'
import { StatusCodes } from 'http-status-codes'
import { rateLimit } from '@/lib/rate-limit'

type LoginResponse = {
    error?: string;
    success?: boolean;
    message?: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        createdAt: Date;
    };
}

/**
 * @api {post} /api/auth/login Login user
 * @apiName LoginUser
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email address
 * @apiBody {String} password User's password
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Login successful!",
 *       "user": {
 *         "id": "clm123abc...",
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "isVerified": true,
 *         "createdAt": "2025-09-14T12:00:00.000Z"
 *       }
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid email or password"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Please verify your email address before logging in"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Please enter a valid email address"
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
    const { success: allowed, retryAfter } = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: StatusCodes.TOO_MANY_REQUESTS, headers: { 'Retry-After': String(retryAfter) } }
        )
    }

    try {
        const { cfTurnstileToken, ...body } = await request.json()

        // CAPTCHA verification disabled temporarily
        // const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         secret: process.env.TURNSTILE_SECRET_KEY,
        //         response: cfTurnstileToken,
        //     }),
        // })
        // const verifyData = await verifyRes.json()
        // if (!verifyData.success) {
        //     return NextResponse.json(
        //         { error: 'CAPTCHA verification failed. Please try again.' },
        //         { status: StatusCodes.BAD_REQUEST }
        //     )
        // }

        const result = await login(body) as LoginResponse

        if (result.error) {
            return NextResponse.json(
                { result: result },
                { status: 400 }
            )
        }

        const response = NextResponse.json(
            {
                success: result.success,
                message: result.message,
                user: result.user,
                token: result.token
            },
            { status: StatusCodes.OK }
        )

        // Ensure the auth-token cookie is set in the response
        if (result.token) {
            response.cookies.set('auth-token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
            })
        }

        return response
    } catch (error) {
        console.error('Login API Route Error:', error)

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