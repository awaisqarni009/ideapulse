'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  initialSearch?: string;
  className?: string;
}

export function SearchBar({ initialSearch = '', className = '' }: SearchBarProps) {
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
    <div className={`relative w-full max-w-md flex-1 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-tertiary)]">
        <Search className="h-4 w-4" />
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
        placeholder="Search events, summits, keynotes & topics..."
        aria-label="Search events by title or summary"
        className="focus:ring-[var(--indigo-bright)]/30 w-full rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] py-2.5 pl-10 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-inner backdrop-blur-md transition-all hover:border-[var(--border-strong)] focus:border-[var(--indigo-bright)] focus:outline-none focus:ring-2 sm:text-sm"
        style={{
          boxShadow: 'inset 0 1px 0 var(--edge-specular)',
        }}
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isPending && (
        <span className="absolute right-10 top-3 flex h-3 w-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--cyan-bright)]" />
        </span>
      )}
    </div>
  );
}
