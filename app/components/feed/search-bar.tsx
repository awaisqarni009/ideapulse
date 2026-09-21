'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SearchBarProps {
  initialSearch?: string;
}

export function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialSearch);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const updateSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = newQuery.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    updateSearch('');
  };

  return (
    <div className="relative w-full max-w-md flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)]">
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            updateSearch(query);
          }
        }}
        onBlur={() => {
          if (query !== (searchParams.get('q') || '')) {
            updateSearch(query);
          }
        }}
        placeholder="Search proposals by title or topic..."
        aria-label="Search ideas by title or summary"
        className="w-full rounded-xl border border-[var(--edge-subtle)] bg-[var(--surface-2)] py-2 pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-inner backdrop-blur-md transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--indigo-bright)]"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {isPending && (
        <span className="absolute right-10 top-2.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan-bright)] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cyan-bright)]"></span>
        </span>
      )}
    </div>
  );
}
