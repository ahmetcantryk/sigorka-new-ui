import { useRef, useEffect } from 'react';

export const useSlideAnimation = (isOpen: boolean, duration: number = 300) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isOpen) {
        element.style.height = 'auto';
      } else {
        element.style.height = '0px';
      }
      return;
    }

    if (isOpen) {
      element.style.height = '0px';
      element.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        const height = element.scrollHeight;
        element.style.height = `${height}px`;
        
        const timeout = setTimeout(() => {
          element.style.height = 'auto';
          element.style.overflow = '';
        }, duration);
        
        return () => clearTimeout(timeout);
      });
    } else {
      const height = element.scrollHeight;
      element.style.height = `${height}px`;
      element.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        element.style.height = '0px';
        
        const timeout = setTimeout(() => {
          element.style.overflow = '';
        }, duration);
        
        return () => clearTimeout(timeout);
      });
    }
  }, [isOpen, duration]);

  return { contentRef };
};
