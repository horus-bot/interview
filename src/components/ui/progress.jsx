"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";



const Progress = React.forwardRef(


  ({ className, value, ...props }, ref) =>
  <ProgressPrimitive.Root
    ref={ref}




    {...props}>
    
    <ProgressPrimitive.Indicator

      style={{ height: "100%", width: "100%", flex: "1 1 0%", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", transform: `translateX(-${100 - (value || 0)}%)` }} />
    
  </ProgressPrimitive.Root>
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };