import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'focus-ring min-h-[96px] w-full rounded-md border border-neutral-200 bg-surface px-3.5 py-3 text-base text-body placeholder:text-neutral-400',
        'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';