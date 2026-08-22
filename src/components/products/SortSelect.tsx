'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SortSelectProps {
  current: string;
}

export function SortSelect({ current }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const newSort = e.target.value;
    if (newSort === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      aria-label="Sort products"
      className="bg-transparent pr-1 text-sm font-semibold text-heading focus:outline-none cursor-pointer"
      value={current}
      onChange={handleChange}
    >
      <option value="relevance">Relevance</option>
      <option value="name-asc">Name A-Z</option>
      <option value="newest">Newest first</option>
    </select>
  );
}
