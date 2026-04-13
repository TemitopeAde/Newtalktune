import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio, TTSError } from '@/lib/tts';

// YarnGPT Voice Models (for case-insensitive lookup)
const YARN_GPT_VOICES = [
    { id: "Idera", name: "Idera" },
    { id: "Emma", name: "Emma" },
    { id: "Zainab", name: "Zainab" },
    { id: "Osagie", name: "Osagie" },
    { id: "Wura", name: "Wura" },
    { id: "Jude", name: "Jude" },
    { id: "Chinenye", name: "Chinenye" },
    { id: "Tayo", name: "Tayo" },
    { id: "Regina", name: "Regina" },
    { id: "Femi", name: "Femi" },
    { id: "Adaora", name: "Adaora" },
    { id: "Umar", name: "Umar" },
    { id: "Mary", name: "Mary" },
    { id: "Nonso", name: "Nonso" },
    { id: "Remi", name: "Remi" },
    { id: "Adam", name: "Adam" }
];
const YARNGPT_MAX_TEXT_LENGTH = 2000;

// Helper function to get proper voice name from voice ID (case-insensitive lookup)
function getProperVoiceName(voiceId: string): string {
    const voice = YARN_GPT_VOICES.find(v => v.id.toLowerCase() === voiceId.toLowerCase());
    return voice ? voice.id : voiceId;
}

/**
 * YarnGPT Text-to-Speech API Endpoint
 * 
 * @route POST /api/tts
 * @description Converts text to speech using YarnGPT API
 * @body {object} request
 * @body {string} request.text - Text to convert to speech (required)
 * @body {string} [request.voice] - Voice to use (optional)
 * @body {string} [request.response_format] - Audio format: mp3, wav, opus, flac (optional, defaults to mp3)
 * 
 * @returns {Response} Audio file stream
 * 
 * @example
 * ```javascript
 * const response = await fetch('/api/tts', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     text: "Hello, world!",
 *     voice: "alloy",
 *     response_format: "mp3"
 *   })
 * });
 * 
 * if (response.ok) {
 *   const audioBlob = await response.blob();
 *   // Use the audio blob for playback
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
        const body = await request.json();
        const { text, voice, response_format = 'mp3' } = body;

        console.log('[TTS_ROUTE_REQUEST]', {
            requestId,
            textLength: typeof text === 'string' ? text.length : null,
            trimmedTextLength: typeof text === 'string' ? text.trim().length : null,
            textPreview: typeof text === 'string' ? text.slice(0, 120) : null,
            voice: typeof voice === 'string' ? voice : null,
            responseFormat: response_format
        });

        // Validate required fields
        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Text must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate response format
        const validFormats = ['mp3', 'wav', 'opus', 'flac'];
        if (response_format && !validFormats.includes(response_format)) {
            return NextResponse.json(
                {
                    error: 'Invalid response format',
                    details: `Supported formats: ${validFormats.join(', ')}`
                },
                { status: 400 }
            );
        }

        if (text.length > YARNGPT_MAX_TEXT_LENGTH) {
            return NextResponse.json(
                {
                    error: 'Text is too long for YarnGPT TTS',
                    details: `YarnGPT currently supports up to ${YARNGPT_MAX_TEXT_LENGTH} characters. Received ${text.length}.`
                },
                { status: 400 }
            );
        }

        // Ensure proper capitalization for voice name
        const properVoiceName = voice ? getProperVoiceName(voice) : undefined;

        console.log('[TTS_ROUTE_FORWARD]', {
            requestId,
            properVoiceName,
            responseFormat: response_format
        });

        // Generate audio using YarnGPT API
        const audioBuffer = await generateTTSAudio(text, properVoiceName, response_format);

        // Get appropriate MIME type
        const mimeTypes: Record<string, string> = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'opus': 'audio/opus',
            'flac': 'audio/flac'
        };

        const mimeType = mimeTypes[response_format] || 'audio/mpeg';

        // Return audio data
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="audio.${response_format}"`,
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });

    } catch (error) {
        console.error('TTS API Error:', error);
        console.error('[TTS_ROUTE_ERROR]', {
            requestId,
            errorName: error instanceof Error ? error.name : 'UnknownError',
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
            errorDetails: error instanceof TTSError ? error.details : ''
        });

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const errorDetails = error instanceof TTSError ? error.details : '';
        const statusCode = error instanceof TTSError ? error.status : 500;

        return NextResponse.json(
            {
                error: 'Failed to generate audio',
                details: errorDetails || errorMessage
            },
            { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 }
        );
    }
}

/**
 * Handle GET requests - return API documentation
 */
export async function GET() {
    return NextResponse.json({
        message: 'YarnGPT Text-to-Speech API',
        description: 'Convert text to speech using YarnGPT API',
        usage: {
            method: 'POST',
            endpoint: '/api/tts',
            body: {
                text: 'string (required) - Text to convert to speech',
                voice: 'string (optional) - Voice to use',
                response_format: 'string (optional) - Audio format: mp3, wav, opus, flac (defaults to mp3)'
            },
            response: 'Audio file stream'
        },
        example: {
            text: "Hello, world!",
            voice: "alloy",
            response_format: "mp3"
        }
    });
}
