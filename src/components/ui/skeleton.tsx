import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Loading skeleton with 1.4s shimmer (DESIGN_SYSTEM.md §5).
 * Variants: image rect, text lines, price, card grid.
 */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-neutral-100',
        'after:absolute after:inset-0 after:animate-pulse after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonImage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('aspect-square w-full', className)} {...props} />;
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3.5 w-full" />
      ))}
    </div>
  );
}

export function SkeletonPrice({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('h-5 w-20', className)} {...props} />;
}

export function SkeletonCard({
  variant = 'listing-card',
  className,
}: {
  variant?: 'listing-card' | 'product-card';
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg bg-surface p-3 shadow-card', className)}>
      <SkeletonImage className="mb-3" />
      <SkeletonText lines={2} />
      <div className="mt-3 flex items-center justify-between">
        <SkeletonPrice />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}