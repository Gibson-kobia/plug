'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/**
 * Toast provider wrapper (DESIGN_SYSTEM.md §5 — sonner).
 * Place once in the root layout. Positioned bottom on mobile, top-right desktop.
 */
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme={props.theme ?? 'light'}
      position={props.position ?? 'top-right'}
      toastOptions={{
        style: {
          fontFamily: 'inherit',
        },
      }}
      {...props}
    />
  );
}