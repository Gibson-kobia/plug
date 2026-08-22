import * as React from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'destructive'
  | 'whatsapp';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-cta hover:bg-primary-hover focus-visible:ring-copper-300',
  secondary:
    'bg-secondary text-white hover:bg-navy-600 focus-visible:ring-navy-600',
  outline:
    'border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100',
  ghost:
    'bg-transparent text-body hover:bg-neutral-100 text-copper-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
  whatsapp:
    'bg-whatsapp text-white hover:opacity-95 focus-visible:ring-whatsapp',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-md px-3 text-xs',
  default: 'h-12 rounded-md px-5 text-sm',
  lg: 'h-14 rounded-lg px-6 text-base',
  icon: 'h-12 w-12 rounded-md p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'focus-ring inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
