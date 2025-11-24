'use client';

import { useEffect } from 'react';
import ConditionalCTAPopup from '../../components/common/ConditionalCTAPopup';
import { getCTAConfigForBlog } from '../utils/ctaConfig';

interface BlogCTAClientProps {
  categories?: { id: number; name: string; value?: string }[];
}

export default function BlogDetailClient({ categories }: BlogCTAClientProps) {
  const ctaConfig = getCTAConfigForBlog(categories);

  return (
    <ConditionalCTAPopup 
      config={ctaConfig}
      condition="blog-scroll"
    />
  );
}

