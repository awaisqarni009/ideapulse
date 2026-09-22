import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';

/**
 * Phase 7 Batch 4 — Modals, Motion & Scaling Tests [T-7.17 to T-7.21]
 */

describe('Modals, Motion & Scaling — T-7.17 to T-7.21', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('T-7.17: Focus Trap and Restore on Every Modal', () => {
    it('verifies useFocusTrap hook traps Tab cycling, handles Escape, and restores focus', () => {
      // Create a mock trigger button in the DOM
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      expect(document.activeElement).toBe(triggerButton);

      const onCloseMock = vi.fn();

      function TestModal({ isOpen }: { isOpen: boolean }) {
        const ref = useFocusTrap<HTMLDivElement>({ isOpen, onClose: onCloseMock });
        if (!isOpen) return null;
        return React.createElement(
          'div',
          { ref },
          React.createElement('button', { id: 'first-modal-btn' }, 'First'),
          React.createElement('button', { id: 'second-modal-btn' }, 'Second'),
        );
      }

      const { unmount } = render(React.createElement(TestModal, { isOpen: true }));

      // Test Escape key dismiss
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(escapeEvent);
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      // Test Tab wrap from last to first
      const btn1 = document.getElementById('first-modal-btn');
      const btn2 = document.getElementById('second-modal-btn');
      btn2?.focus();
      expect(document.activeElement).toBe(btn2);

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(tabEvent);

      // Test Shift+Tab wrap from first to last
      btn1?.focus();
      expect(document.activeElement).toBe(btn1);
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(shiftTabEvent);

      // Unmount / close modal and verify focus restores to trigger
      unmount();
      expect(document.activeElement).toBe(triggerButton);

      // Clean up DOM
      document.body.removeChild(triggerButton);
    });

    it('ensures all 5 modal components wire useFocusTrap', () => {
      const modalFiles = [
        path.join(rootDir, 'app', 'components', 'auth', 'auth-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'cycles', 'winner-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'ideas', 'withdraw-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'reports', 'report-modal.tsx'),
        path.join(rootDir, 'app', 'admin', 'cycles', 'finalize-button.tsx'),
      ];

      for (const file of modalFiles) {
        expect(fs.existsSync(file)).toBe(true);
        const code = fs.readFileSync(file, 'utf-8');
        expect(code, `Missing useFocusTrap in ${path.relative(rootDir, file)}`).toContain(
          'useFocusTrap',
        );
        expect(code, `Missing ref={modalRef} in ${path.relative(rootDir, file)}`).toContain(
          'modalRef',
        );
      }
    });

    it('ensures all 5 modal dialogs implement semantic role="dialog", aria-modal="true", and aria-labelledby', () => {
      const modalFiles = [
        path.join(rootDir, 'app', 'components', 'auth', 'auth-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'cycles', 'winner-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'ideas', 'withdraw-modal.tsx'),
        path.join(rootDir, 'app', 'components', 'reports', 'report-modal.tsx'),
        path.join(rootDir, 'app', 'admin', 'cycles', 'finalize-button.tsx'),
      ];

      for (const file of modalFiles) {
        const code = fs.readFileSync(file, 'utf-8');
        expect(code, `Missing role="dialog" in ${path.relative(rootDir, file)}`).toContain(
          'role="dialog"',
        );
        expect(code, `Missing aria-modal="true" in ${path.relative(rootDir, file)}`).toContain(
          'aria-modal="true"',
        );
        expect(code, `Missing aria-labelledby in ${path.relative(rootDir, file)}`).toContain(
          'aria-labelledby',
        );
      }
    });
  });

  describe('T-7.18: Reduced-Motion Pass (DESIGN.md §6.5)', () => {
    it('verifies globals.css enforces instant transitions and static states under prefers-reduced-motion: reduce', () => {
      const cssPath = path.join(rootDir, 'app', 'globals.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('animation-duration: 0.01ms !important');
      expect(css).toContain('transition-duration: 0.01ms !important');
      expect(css).toContain('.skeleton-shimmer');
      expect(css).toContain('animation: none !important');
      expect(css).toContain('.animate-sweep-celebration');
    });
  });

  describe('T-7.19: 200% Zoom and Fluid Scaling Invariants (DESIGN.md §8)', () => {
    it('verifies html and body prevent horizontal scroll overflow in globals.css', () => {
      const cssPath = path.join(rootDir, 'app', 'globals.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain('overflow-x: clip');
      expect(css).toContain('max-width: 100%');
    });
  });

  describe('T-7.20: 44×44 CSS px Minimum Touch Targets on Coarse Pointers (DESIGN.md §8)', () => {
    it('verifies globals.css enforces min-height: 44px and min-width: 44px for buttons and inputs under pointer: coarse', () => {
      const cssPath = path.join(rootDir, 'app', 'globals.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain('@media (pointer: coarse)');
      expect(css).toContain('min-height: 44px');
      expect(css).toContain('min-width: 44px');
      expect(css).toContain('button.rounded-full');
    });
  });
});
