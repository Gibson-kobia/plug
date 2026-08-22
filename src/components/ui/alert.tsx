import * as React from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const variantIcon: Record<AlertVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-info/30 bg-neutral-50 text-body',
  success: 'border-success/30 bg-jade-50 text-body',
  warning: 'border-warning/30 bg-amber-50 text-body',
  error: 'border-error/30 bg-rose-50 text-body',
};

const iconColors: Record<AlertVariant, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export function Alert({ variant = 'info', title, className, children, ...props }: AlertProps) {
  const Icon = variantIcon[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-md border p-4',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[variant])} />
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-semibold text-heading">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}