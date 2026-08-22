import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * KES price display (DESIGN_SYSTEM.md §5 Price):
 * formats amounts with tabular numerals; optional compare-at strikethrough
 * and discount % badge. Pure formatter — no business values invented here.
 */

export function formatKES(amountKes: number): string {
  const safe = Number.isFinite(amountKes) ? amountKes : 0;
  return `KES ${Math.round(safe).toLocaleString('en-KE')}`;
}

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  compareAt?: number;
  size?: 'sm' | 'lg';
  showDiscountPercent?: boolean;
}

export function Price({
  amount,
  compareAt,
  size = 'sm',
  showDiscountPercent = false,
  className,
  ...props
}: PriceProps) {
  const discountPercent =
    compareAt && compareAt > amount && compareAt > 0
      ? Math.round(((compareAt - amount) / compareAt) * 100)
      : null;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)} {...props}>
      <span
        className={cn(
          'tabular-nums text-primary',
          size === 'lg' ? 'text-price-lg' : 'text-price-sm'
        )}
      >
        {formatPrice(amount)}
      </span>
      {typeof compareAt === 'number' && compareAt > amount && (
        <span className="text-neutral-400 line-through">{formatPrice(compareAt)}</span>
      )}
      {showDiscountPercent && discountPercent !== null && (
        <span className="rounded-full bg-rose-50 px-1.5 text-xs font-semibold text-rose-600">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

function formatPrice(amountKes: number): string {
  return `KSh ${Math.round(amountKes).toLocaleString('en-KE')}`;
}