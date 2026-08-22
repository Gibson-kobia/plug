import * as React from 'react';

import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'verified'
  | 'warranty'
  | 'new'
  | 'sale'
  | 'negotiable'
  | 'used'
  | 'oos'
  | 'low_stock'
  | 'trending'
  | 'reserved'
  | 'secondary'
  | 'outline'
  | 'destructive';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  verified: 'bg-success/10 text-success',
  warranty: 'bg-jade-100 text-jade-600',
  new: 'bg-copper-500 text-white',
  sale: 'bg-rose-600 text-white',
  negotiable: 'bg-amber-500 text-white',
  used: 'bg-slate-200 text-slate-700',
  oos: 'bg-rose-50 text-rose-700',
  low_stock: 'bg-amber-50 text-amber-700',
  trending: 'bg-copper-100 text-copper-700',
  reserved: 'bg-navy-100 text-navy-700',
  secondary: 'bg-secondary text-secondary',
  outline: 'border border-neutral-200 text-neutral-700 bg-transparent',
  destructive: 'bg-rose-100 text-rose-700 border border-rose-200',
};

export function Badge({ className, variant = 'new', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
