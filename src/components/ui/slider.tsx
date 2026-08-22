'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-200">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {Array.from({ length: Array.isArray(props.value) ? props.value.length : 1 }).map(
      (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="focus-ring block h-5 w-5 rounded-full border-2 border-primary bg-white shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:pointer-events-none"
        />
      )
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;