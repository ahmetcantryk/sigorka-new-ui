import { useRef, useCallback } from 'react';

interface DropdownManagerOptions {
  fadeDuration?: number;
  hoverDelay?: number;
  leaveDelay?: number;
}

export class DropdownManager {
  private activeDropdown: HTMLElement | null = null;
  private hoverTimeout: NodeJS.Timeout | null = null;
  private fadeTimeout: NodeJS.Timeout | null = null;
  private options: Required<DropdownManagerOptions>;

  constructor(options: DropdownManagerOptions = {}) {
    this.options = {
      fadeDuration: options.fadeDuration || 500,
      hoverDelay: options.hoverDelay || 50,
      leaveDelay: options.leaveDelay || 100
    };
  }

  private fadeIn(element: HTMLElement, callback?: () => void) {
    element.style.display = 'block';
    element.style.opacity = '0';
    element.style.visibility = 'visible';
    element.style.pointerEvents = 'auto';
    element.style.transition = `opacity ${this.options.fadeDuration}ms ease, visibility ${this.options.fadeDuration}ms ease`;
    
    // Force reflow
    element.offsetHeight;
    
    element.style.opacity = '1';
    
    if (callback) {
      this.fadeTimeout = setTimeout(callback, this.options.fadeDuration);
    }
  }

  private fadeOut(element: HTMLElement, callback?: () => void) {
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
    element.style.transition = `opacity ${this.options.fadeDuration}ms ease, visibility ${this.options.fadeDuration}ms ease`;
    
    this.fadeTimeout = setTimeout(() => {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.transition = '';
      if (callback) {
        callback();
      }
    }, this.options.fadeDuration);
  }

  private slideDown(element: HTMLElement, callback?: () => void) {
    element.style.display = 'block';
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${this.options.fadeDuration}ms ease-in-out`;
    
    // Force reflow
    element.offsetHeight;
    
    const scrollHeight = element.scrollHeight;
    element.style.height = `${scrollHeight}px`;
    
    if (callback) {
      this.fadeTimeout = setTimeout(callback, this.options.fadeDuration);
    }
  }

  private slideUp(element: HTMLElement, callback?: () => void) {
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${this.options.fadeDuration}ms ease-in-out`;
    
    // Force reflow
    element.offsetHeight;
    
    element.style.height = '0px';
    
    this.fadeTimeout = setTimeout(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
      if (callback) {
        callback();
      }
    }, this.options.fadeDuration);
  }

  private clearTimeouts() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }

  private clearHoverEffects() {
    const dropdownItems = document.querySelectorAll('.main-nav__item--dropdown');
    dropdownItems.forEach(item => {
      const link = item.querySelector('.main-nav__link') as HTMLElement;
      if (link) {
        link.classList.remove('hover-active');
      }
    });
  }

  handleMouseEnter(item: HTMLElement) {
    this.clearTimeouts();
    
    this.hoverTimeout = setTimeout(() => {
      const subNav = item.querySelector('.sub-nav') as HTMLElement;
      if (!subNav) return;

      // Close other dropdowns
      if (this.activeDropdown && this.activeDropdown !== subNav) {
        this.closeDropdown(this.activeDropdown);
      }

      // Open current dropdown
      this.openDropdown(subNav);
      this.activeDropdown = subNav;

      // Add hover effect
      const link = item.querySelector('.main-nav__link') as HTMLElement;
      if (link) {
        link.classList.add('hover-active');
      }
    }, this.options.hoverDelay);
  }

  handleMouseLeave(item: HTMLElement) {
    this.clearTimeouts();
    
    this.hoverTimeout = setTimeout(() => {
      const subNav = item.querySelector('.sub-nav') as HTMLElement;
      if (!subNav) return;

      this.closeDropdown(subNav);
      
      if (this.activeDropdown === subNav) {
        this.activeDropdown = null;
      }

      // Clear hover effect
      const link = item.querySelector('.main-nav__link') as HTMLElement;
      if (link) {
        link.classList.remove('hover-active');
      }
    }, this.options.leaveDelay);
  }

  private openDropdown(element: HTMLElement) {
    const isMobile = window.innerWidth < 992;
    
    if (isMobile) {
      this.slideDown(element);
    } else {
      this.fadeIn(element);
    }
  }

  private closeDropdown(element: HTMLElement) {
    const isMobile = window.innerWidth < 992;
    
    if (isMobile) {
      this.slideUp(element);
    } else {
      this.fadeOut(element);
    }
  }

  closeAllDropdowns() {
    this.clearTimeouts();
    this.clearHoverEffects();
    
    const dropdownItems = document.querySelectorAll('.main-nav__item--dropdown .sub-nav');
    dropdownItems.forEach(item => {
      this.closeDropdown(item as HTMLElement);
    });
    
    this.activeDropdown = null;
  }

  destroy() {
    this.clearTimeouts();
    this.closeAllDropdowns();
  }
}

export function useDropdownManager(options?: DropdownManagerOptions) {
  const managerRef = useRef<DropdownManager | null>(null);

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      managerRef.current = new DropdownManager(options);
    }
    return managerRef.current;
  }, [options]);

  return {
    getManager,
    destroy: () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    }
  };
}
