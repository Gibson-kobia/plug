import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'product-card' | 'listing-card' | 'seller-card' | 'filter-card';
}

const variantClasses = {
  'product-card': 'rounded-lg bg-surface p-3 shadow-card hover:shadow-lg',
  'listing-card': 'rounded-lg bg-surface p-3 shadow-card',
  'seller-card': 'rounded-lg bg-surface p-4 shadow-card',
  'filter-card': 'rounded-lg bg-neutral-50 p-4',
} as const;

export function Card({ className, variant = 'listing-card', ...props }: CardProps) {
  return <div className={cn(variantClasses[variant], className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-semibold text-heading', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-3', className)} {...props} />;
}