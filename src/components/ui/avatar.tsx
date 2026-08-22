import * as React from 'react';

import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Initials fallback + onError (DESIGN_SYSTEM.md §5 Avatar). */
export function Avatar({ src, alt, name, size = 'md', className, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 font-semibold text-neutral-500',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? 'avatar'}
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials || '?'}</span>
      )}
    </div>
  );
}