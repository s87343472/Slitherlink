import { NextRequest, NextResponse } from 'next/server';
import { validateTurnstileToken } from '@/lib/services/turnstileService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, display_name, turnstileToken } = body;

    // Validate required fields
    if (!email || !username || !password || !display_name) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'All fields are required',
        },
      }, { status: 400 });
    }

    // Validate field lengths
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters long',
        },
      }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: 'Username must be at least 3 characters long',
        },
      }, { status: 400 });
    }

    if (display_name.length < 2) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_DISPLAY_NAME',
          message: 'Display name must be at least 2 characters long',
        },
      }, { status: 400 });
    }

    // Verify Turnstile token if provided (optional for backwards compatibility)
    if (turnstileToken) {
      // Allow development bypass token
      if (process.env.NODE_ENV === 'development' && turnstileToken === 'dev-bypass-token') {
        // Skip verification in development mode
      } else {
        const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
          || request.headers.get('x-real-ip') 
          || undefined;

        const turnstileResult = await validateTurnstileToken(turnstileToken, clientIP);
        
        if (!turnstileResult.isValid) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'TURNSTILE_VERIFICATION_FAILED',
              message: turnstileResult.error || 'Security verification failed',
            },
          }, { status: 400 });
        }
      }
    }

    // For development/demo purposes, handle mock registration
    if (process.env.NODE_ENV === 'development') {
      // Simulate email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Invalid email format',
          },
        }, { status: 400 });
      }

      // Create mock user
      const mockUser = {
        id: Math.floor(Math.random() * 1000) + 2,
        email,
        username,
        display_name,
        created_at: new Date().toISOString(),
        last_login: null,
      };

      const mockPermissions = {
        hasLeaderboardAccess: false,
        hasAdFreeAccess: false,
      };

      const mockToken = `mock_token_${Date.now()}`;

      return NextResponse.json({
        success: true,
        data: {
          user: mockUser,
          permissions: mockPermissions,
          token: mockToken,
        },
      });
    }

    // In production, this would integrate with your actual authentication system
    // and make a request to your backend API
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Production registration not implemented',
      },
    }, { status: 501 });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    }, { status: 500 });
  }
}