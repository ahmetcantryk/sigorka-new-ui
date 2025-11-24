/**
 * useFormPersistence Hook
 * 
 * Form verilerini localStorage'da saklar ve geri yükler
 * Kullanıcı sayfayı yenilediğinde form verileri korunur
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

interface PersistenceOptions {
  storageKey: string;
  expirationMinutes?: number;
}

export const useFormPersistence = <T extends Record<string, any>>(
  initialValues: T,
  options: PersistenceOptions
) => {
  const { storageKey, expirationMinutes = 30 } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [isRestored, setIsRestored] = useState(false);

  // localStorage'dan veri yükle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        
        // Expiration kontrolü
        const now = Date.now();
        const elapsed = (now - timestamp) / 1000 / 60; // dakika cinsinden
        
        if (elapsed < expirationMinutes) {
          setValues(data);
          setIsRestored(true);
        } else {
          // Süresi dolmuş, temizle
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Form persistence error:', error);
    }
  }, [storageKey, expirationMinutes]);

  // localStorage'a kaydet
  const saveValues = useCallback((newValues: Partial<T>) => {
    const updated = { ...values, ...newValues };
    setValues(updated);

    if (typeof window !== 'undefined') {
      try {
        const dataToStore = {
          data: updated,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Failed to save form data:', error);
      }
    }
  }, [values, storageKey]);

  // Temizle
  const clearValues = useCallback(() => {
    setValues(initialValues);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [initialValues, storageKey]);

  return {
    values,
    isRestored,
    saveValues,
    clearValues,
    setValues,
  };
};


