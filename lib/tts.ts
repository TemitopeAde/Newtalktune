import { TTSRequest, TTSResponse } from '@/types/tts';

const YARNGPT_API_URL = 'https://yarngpt.ai/api/v1/tts';
const YARNGPT_MAX_TEXT_LENGTH = 2000;

export class TTSError extends Error {
    status: number;
    details: string;

    constructor(message: string, status: number, details = '') {
        super(message);
        this.name = 'TTSError';
        this.status = status;
        this.details = details;
    }
}

/**
 * Generate audio using YarnGPT TTS API
 * @param text - The text to convert to speech
 * @param voice - The voice to use (optional)
 * @param response_format - The audio format (optional, defaults to mp3)
 * @returns Promise<ArrayBuffer> - The audio data
 */
export async function generateTTSAudio(
    text: string,
    voice?: string,
    response_format?: 'mp3' | 'wav' | 'opus' | 'flac'
): Promise<ArrayBuffer> {
    const apiKey = process.env.YARN_GPT_API_KEY || process.env.YARN_GTP_API_KEY;

    if (!apiKey) {
        throw new TTSError(
            'YarnGPT API key is not configured. Please add YARN_GPT_API_KEY to your .env file.',
            500
        );
    }

    if (text.length > YARNGPT_MAX_TEXT_LENGTH) {
        throw new TTSError(
            `Text exceeds YarnGPT limit of ${YARNGPT_MAX_TEXT_LENGTH} characters.`,
            400,
            `Received ${text.length} characters.`
        );
    }

    const requestBody: TTSRequest = {
        text,
        ...(voice && { voice }),
        ...(response_format && { response_format })
    };

    console.log('[TTS_PROVIDER_REQUEST]', {
        endpoint: YARNGPT_API_URL,
        textLength: text.length,
        textPreview: text.slice(0, 120),
        voice: voice ?? null,
        responseFormat: response_format ?? 'mp3'
    });

    const response = await fetch(YARNGPT_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });


    if (!response.ok) {
        let errorMessage = `TTS API error: ${response.status}`;
        let errorDetails = '';
        const contentType = response.headers.get('content-type');

        try {
            const responseText = await response.text();
            console.log('TTS Error Response:', responseText);
            console.error('[TTS_PROVIDER_ERROR_RESPONSE]', {
                status: response.status,
                statusText: response.statusText,
                contentType,
                bodyPreview: responseText.slice(0, 500)
            });

            try {
                const errorData = JSON.parse(responseText);

                // Special handling for stale request error
                if (errorData.message && errorData.message.includes('Stale request')) {
                    errorMessage = 'Time synchronization error. Please ensure your system clock is set correctly and try again.';
                    console.error('System time issue detected. Current time:', new Date().toISOString());
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                    if (errorData.details) {
                        errorDetails = errorData.details;
                        errorMessage += `: ${errorData.details}`;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                    if (errorData.details) {
                        errorDetails = errorData.details;
                    }
                }
            } catch {
                // If we can't parse as JSON, use the raw text
                errorDetails = responseText;
                errorMessage += `: ${responseText}`;
            }
        } catch {
            // If we can't read the response, use the status text
            errorMessage += ` ${response.statusText}`;
        }

        console.error('TTS API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            contentType,
            message: errorMessage,
            details: errorDetails
        });
        throw new TTSError(errorMessage, response.status, errorDetails);
    }

    // Return the audio data as ArrayBuffer
    return await response.arrayBuffer();
}

/**
 * Convert ArrayBuffer to Blob for audio playback
 * @param audioBuffer - The audio ArrayBuffer
 * @param mimeType - The MIME type of the audio (defaults to audio/mpeg for mp3)
 * @returns Blob - The audio blob
 */
export function audioBufferToBlob(audioBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Blob {
    return new Blob([audioBuffer], { type: mimeType });
}

/**
 * Create an audio URL from ArrayBuffer for playback
 * @param audioBuffer - The audio ArrayBuffer
 * @param mimeType - The MIME type of the audio
 * @returns string - The object URL for audio playback
 */
export function createAudioUrl(audioBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): string {
    const blob = audioBufferToBlob(audioBuffer, mimeType);
    return URL.createObjectURL(blob);
}

/**
 * Get MIME type for audio format
 * @param format - The audio format
 * @returns string - The corresponding MIME type
 */
export function getAudioMimeType(format: string = 'mp3'): string {
    const mimeTypes: Record<string, string> = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'opus': 'audio/opus',
        'flac': 'audio/flac'
    };

    return mimeTypes[format] || 'audio/mpeg';
}
