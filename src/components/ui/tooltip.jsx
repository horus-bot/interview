"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";



const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(


  ({ className, sideOffset = 4, ...props }, ref) =>
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}




    {...props} />

);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };