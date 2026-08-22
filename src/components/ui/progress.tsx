import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..100 */
  value: number;
  /** Accessible label, e.g. "20:00 reservation remaining" */
  label?: string;
}

/** TTL countdown / progress bar (DESIGN_SYSTEM.md §5 Progress). */
export function Progress({ value, label, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-neutral-200', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          clamped <= 20 ? 'bg-error' : clamped <= 50 ? 'bg-warning' : 'bg-success'
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}