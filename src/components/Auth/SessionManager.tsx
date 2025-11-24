'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const store = useAuthStore((state) => state);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Activity tracking events
  const activityEvents = [
    'mousedown',
    'mousemove', 
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ] as const;

  const handleActivity = useCallback(() => {
    if (!store.isAuthenticated || !store.extendSessionOnActivity) return;

    // Throttle activity updates to avoid too frequent calls
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      store.updateActivity();
    }, 30000); // Update activity every 30 seconds max
  }, [store.isAuthenticated, store.extendSessionOnActivity, store.updateActivity]);

  useEffect(() => {
    if (store.isAuthenticated && store.extendSessionOnActivity) {
      // Add event listeners for user activity
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        // Cleanup event listeners
        activityEvents.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
        
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
          activityTimeoutRef.current = null;
        }
      };
    }
  }, [store.isAuthenticated, store.extendSessionOnActivity, handleActivity]);

  // Session warning and expiry event handlers
  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
    };

    const handleSessionExpired = () => {
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/giris-yap';
      }, 3000);
    };

    // Listen for session events
    window.addEventListener('sessionWarning', handleSessionWarning as EventListener);
    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning as EventListener);
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  return <>{children}</>;
};

export default SessionManager; 