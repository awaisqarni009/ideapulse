'use client';

import { useEffect, useRef, type RefObject } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useFocusTrap hook per DESIGN.md §7.9 and TASKS.md [T-7.17]
 * - Focus trapped on open: Tab wraps from last to first, Shift+Tab wraps from first to last
 * - Escape key triggers onClose()
 * - Focus returns to the trigger element when closed
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  initialFocusRef,
}: UseFocusTrapOptions): RefObject<T> {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Save currently active element to restore later
    if (typeof document !== 'undefined') {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
    }

    const container = containerRef.current;
    if (!container) return;

    const getFocusableElements = (): HTMLElement[] => {
      if (!container) return [];
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      return nodes.filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
      );
    };

    // 2. Set initial focus after a tick to allow animations/renders to settle
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = getFocusableElements();
        if (focusable.length > 0 && focusable[0]) {
          focusable[0].focus();
        } else {
          container.focus();
        }
      }
    }, 20);

    // 3. Tab cycling and Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 4. Restore focus upon close / unmount
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function' &&
        document.body.contains(previousActiveElement.current)
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  return containerRef;
}
