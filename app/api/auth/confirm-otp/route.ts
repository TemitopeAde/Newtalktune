/**
 * @api {post} /api/confirm-otp Confirm OTP for email verification
 * @apiName ConfirmOTP
 * @apiGroup Auth
 * 
 * @apiBody {String} email User's email address
 * @apiBody {String} otp 6-digit verification code
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Email verified successfully! You can now log in to your account.",
 *       "user": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "isVerified": true
 *       }
 *     }
 * 
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email and OTP are required"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid or expired verification code. Please check your code or request a new one."
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "OTP must be 6 digits"
 *     }
 * 
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Internal server error"
 *     }
 */

import { confirmOTP } from "@/actions/confirmOtp"
import { NextRequest, NextResponse } from "next/server"
import { StatusCodes } from 'http-status-codes'
import { rateLimit } from '@/lib/rate-limit'



export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ??
               request.headers.get('x-real-ip') ?? 'unknown'
    const { success: allowed, retryAfter } = rateLimit(`confirm-otp:${ip}`, 10, 15 * 60 * 1000)
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: StatusCodes.TOO_MANY_REQUESTS, headers: { 'Retry-After': String(retryAfter) } }
        )
    }

    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status:  StatusCodes.BAD_REQUEST }
            )
        }

        const result = await confirmOTP(email, parseInt(otp))

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            user: result.user
        })

    } catch (error) {
        console.error("Confirm OTP route error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}