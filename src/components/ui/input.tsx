import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'focus-ring h-12 w-full rounded-md border bg-surface px-3.5 text-base text-body placeholder:text-neutral-400',
        'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none',
        variant === 'default' && 'border-neutral-200',
        variant === 'error' && 'border-error focus-visible:ring-error/30',
        variant === 'success' && 'border-success focus-visible:ring-success/30',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';