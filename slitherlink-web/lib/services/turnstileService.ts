/**
 * Cloudflare Turnstile Verification Service
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerificationResult {
  success: boolean;
  'error-codes'?: string[];
  'challenge_ts'?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export interface TurnstileVerificationRequest {
  token: string;
  remoteip?: string;
  idempotency_key?: string;
}

/**
 * Verify a Turnstile token with Cloudflare's API
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
  idempotencyKey?: string
): Promise<TurnstileVerificationResult> {
  if (!TURNSTILE_SECRET_KEY) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured');
  }

  if (!token) {
    return {
      success: false,
      'error-codes': ['missing-input-response']
    };
  }

  try {
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }
    
    if (idempotencyKey) {
      formData.append('idempotency_key', idempotencyKey);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TurnstileVerificationResult = await response.json();
    return result;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return {
      success: false,
      'error-codes': ['internal-error']
    };
  }
}

/**
 * Validate Turnstile token and return user-friendly error messages
 */
export async function validateTurnstileToken(
  token: string,
  remoteip?: string
): Promise<{ isValid: boolean; error?: string }> {
  const result = await verifyTurnstileToken(token, remoteip);

  if (result.success) {
    return { isValid: true };
  }

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'missing-input-secret': 'Server configuration error',
    'invalid-input-secret': 'Server configuration error',
    'missing-input-response': 'Security verification is required',
    'invalid-input-response': 'Security verification failed - please try again',
    'bad-request': 'Invalid verification request',
    'timeout-or-duplicate': 'Security verification expired - please try again',
    'internal-error': 'Security verification service unavailable'
  };

  const errorCode = result['error-codes']?.[0];
  const error = errorCode && errorMessages[errorCode] 
    ? errorMessages[errorCode] 
    : 'Security verification failed';

  return { isValid: false, error };
}

/**
 * Middleware function to verify Turnstile token from request
 */
export function createTurnstileMiddleware() {
  return async (request: Request): Promise<{ isValid: boolean; error?: string }> => {
    try {
      const body = await request.json();
      const { turnstileToken } = body;

      if (!turnstileToken) {
        return { isValid: false, error: 'Security verification is required' };
      }

      // Get client IP for additional verification
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || undefined;

      return await validateTurnstileToken(turnstileToken, clientIP);
    } catch (error) {
      console.error('Turnstile middleware error:', error);
      return { isValid: false, error: 'Security verification failed' };
    }
  };
}