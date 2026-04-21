'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-gray-300 transition-colors outline-none data-[state=checked]:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.45rem]'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
