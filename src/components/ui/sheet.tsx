'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

/**
 * Mobile bottom-sheet (Radix Dialog styled as a drawer) —
 * used for filters, carts and action sheets. See DESIGN_SYSTEM.md §5.
 */
export function SheetContent({
  className,
  children,
  side = 'bottom',
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: 'bottom' | 'right' | 'left';
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'focus-ring fixed z-50 bg-surface shadow-xl focus-visible:outline-none',
          side === 'bottom' && 'inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg',
          side === 'right' && 'inset-y-0 right-0 w-[85vw] max-w-md overflow-y-auto',
          side === 'left' && 'inset-y-0 left-0 w-[85vw] max-w-md overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="focus-ring absolute right-4 top-4 rounded-md p-1 text-muted hover:bg-muted hover:text-body">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold text-heading', className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-muted', className)} {...props} />;
}