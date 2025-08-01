'use client';

import React, { useEffect, useRef, useState } from 'react';

// Turnstile API types
declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: (errorCode?: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  size?: 'normal' | 'flexible' | 'compact';
  action?: string;
  cData?: string;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpired?: () => void;
  onTimeout?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  className?: string;
  action?: string;
}

export function TurnstileWidget({
  siteKey,
  onSuccess,
  onError,
  onExpired,
  onTimeout,
  theme = 'auto',
  size = 'normal',
  className = '',
  action
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if site key is configured
  if (!siteKey || siteKey.trim() === '') {
    // In development, show a notice instead of failing
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
          <div className="text-sm text-yellow-800">
            <strong>Development Notice:</strong> Turnstile is not configured. 
            Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in your .env.local file.
          </div>
          <button
            onClick={() => onSuccess('dev-bypass-token')}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Bypass for Development
          </button>
        </div>
      );
    } else {
      // In production, show error
      return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
          <div className="text-sm text-red-800">
            Security verification is temporarily unavailable. Please try again later.
          </div>
        </div>
      );
    }
  }

  // Check if Turnstile is loaded
  useEffect(() => {
    const checkTurnstileLoaded = () => {
      if (window.turnstile) {
        setIsLoaded(true);
        return;
      }
      
      // Check again in 100ms if not loaded
      setTimeout(checkTurnstileLoaded, 100);
    };

    checkTurnstileLoaded();
  }, []);

  // Render widget when loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || widgetIdRef.current) return;

    try {
      const options: TurnstileOptions = {
        sitekey: siteKey,
        callback: (token: string) => {
          setError(null);
          onSuccess(token);
        },
        'error-callback': (errorCode?: string) => {
          setError(errorCode || 'Verification failed');
          onError?.(errorCode);
        },
        'expired-callback': () => {
          setError('Verification expired');
          onExpired?.();
        },
        'timeout-callback': () => {
          setError('Verification timeout');
          onTimeout?.();
        },
        theme,
        size,
      };

      if (action) {
        options.action = action;
      }

      widgetIdRef.current = window.turnstile!.render(containerRef.current, options);
    } catch (err) {
      console.error('Failed to render Turnstile widget:', err);
      setError('Failed to load verification');
    }
  }, [isLoaded, siteKey, onSuccess, onError, onExpired, onTimeout, theme, size, action]);

  // Cleanup widget on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch (err) {
          console.error('Failed to cleanup Turnstile widget:', err);
        }
      }
    };
  }, []);

  // Reset widget function
  const resetWidget = () => {
    if (widgetIdRef.current) {
      try {
        window.turnstile?.reset(widgetIdRef.current);
        setError(null);
      } catch (err) {
        console.error('Failed to reset Turnstile widget:', err);
      }
    }
  };

  // Get response token
  const getResponse = (): string => {
    if (widgetIdRef.current) {
      try {
        return window.turnstile?.getResponse(widgetIdRef.current) || '';
      } catch (err) {
        console.error('Failed to get Turnstile response:', err);
      }
    }
    return '';
  };

  // Expose reset and getResponse methods
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any)._turnstileReset = resetWidget;
      (containerRef.current as any)._turnstileGetResponse = getResponse;
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading verification...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="turnstile-container" />
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

// Helper hook for easier usage
export function useTurnstile(containerRef: React.RefObject<HTMLDivElement>) {
  const resetWidget = () => {
    if (containerRef.current) {
      const reset = (containerRef.current as any)._turnstileReset;
      if (reset) reset();
    }
  };

  const getResponse = (): string => {
    if (containerRef.current) {
      const getResp = (containerRef.current as any)._turnstileGetResponse;
      if (getResp) return getResp();
    }
    return '';
  };

  return { resetWidget, getResponse };
}