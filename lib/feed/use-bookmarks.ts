'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/app/components/ui/toast';

const STORAGE_KEY = 'eventify_saved_events';
const EVENT_NAME = 'eventify_bookmarks_updated';

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const toast = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable or disabled
    }

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setBookmarkedIds(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_NAME, handleSync);
    return () => window.removeEventListener(EVENT_NAME, handleSync);
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds]);

  const toggleBookmark = useCallback(
    (id: string, title?: string) => {
      try {
        const current = [...bookmarkedIds];
        const exists = current.includes(id);
        const updated = exists ? current.filter((item) => item !== id) : [...current, id];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setBookmarkedIds(updated);

        // Notify other listeners
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));

        if (!exists) {
          toast.success(
            title
              ? `Saved "${title.slice(0, 32)}..." to your bookmarks`
              : 'Event saved to your bookmarks',
            'Bookmark Saved',
          );
        } else {
          toast.info(
            title ? `Removed "${title.slice(0, 32)}..." from bookmarks` : 'Removed from bookmarks',
            'Bookmark Removed',
          );
        }

        return !exists;
      } catch {
        return false;
      }
    },
    [bookmarkedIds, toast],
  );

  return {
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
  };
}
