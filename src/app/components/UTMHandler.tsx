'use client';

import { useEffect } from 'react';
import { captureUtmFromCurrentUrl } from '@/utils/utm';

export default function UTMHandler() {
  useEffect(() => {
    // Sayfa yüklendiğinde UTM parametrelerini yakala
    captureUtmFromCurrentUrl();
  }, []);

  return null; // Bu component görünmez
}
