import { NextRequest, NextResponse } from 'next/server';
import { validateTurnstileToken } from '@/lib/services/turnstileService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, turnstileToken } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and password are required',
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

    // For development/demo purposes, handle mock authentication
    if (process.env.NODE_ENV === 'development') {
      // Admin login
      if (email === 'admin@slitherlink.game' && password === 'admin123') {
        const adminUser = {
          id: 1,
          email: 'admin@slitherlink.game',
          username: 'admin',
          display_name: 'Administrator',
          created_at: '2024-01-01T00:00:00.000Z',
          last_login: new Date().toISOString(),
        };

        const adminPermissions = {
          hasLeaderboardAccess: true,
          hasAdFreeAccess: true,
        };

        return NextResponse.json({
          success: true,
          data: {
            user: adminUser,
            permissions: adminPermissions,
            token: 'admin_token_' + Date.now(),
          },
        });
      }

      // Mock user authentication would go here
      // For now, return invalid credentials for non-admin users
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }, { status: 401 });
    }

    // In production, this would integrate with your actual authentication system
    // and make a request to your backend API
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Production authentication not implemented',
      },
    }, { status: 501 });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    }, { status: 500 });
  }
}