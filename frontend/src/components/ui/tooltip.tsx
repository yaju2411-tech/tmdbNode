"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "../ui/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        `
        z-[100] overflow-hidden rounded-xl
        border border-white/10 dark:border-zinc-800
        bg-white/90 dark:bg-zinc-950/95
        backdrop-blur-md
        px-3 py-1.5
        text-xs font-medium
        text-black dark:text-white
        shadow-2xl

        animate-in fade-in-0 zoom-in-95
        data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0
        data-[state=closed]:zoom-out-95

        data-[side=bottom]:slide-in-from-top-2
        data-[side=left]:slide-in-from-right-2
        data-[side=right]:slide-in-from-left-2
        data-[side=top]:slide-in-from-bottom-2
        `,
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
