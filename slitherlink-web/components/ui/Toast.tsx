'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      duration: 5000,
      ...toastData,
    };

    setToasts(prev => [...prev, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onHide }: { toasts: Toast[]; onHide: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onHide }: { toast: Toast; onHide: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onHide(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = "p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-out";
    const positionStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${positionStyles} bg-white border-green-200`;
      case 'error':
        return `${baseStyles} ${positionStyles} bg-white border-red-200`;
      case 'warning':
        return `${baseStyles} ${positionStyles} bg-white border-yellow-200`;
      case 'info':
        return `${baseStyles} ${positionStyles} bg-white border-blue-200`;
      default:
        return `${baseStyles} ${positionStyles} bg-white border-gray-200`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600">
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Convenience hooks for different toast types
export function useToastActions() {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string, action?: Toast['action']) => 
      showToast({ type: 'success', title, message, action }),
    
    error: (title: string, message?: string, action?: Toast['action']) => 
      showToast({ type: 'error', title, message, action }),
    
    warning: (title: string, message?: string, action?: Toast['action']) => 
      showToast({ type: 'warning', title, message, action }),
    
    info: (title: string, message?: string, action?: Toast['action']) => 
      showToast({ type: 'info', title, message, action }),
  };
}