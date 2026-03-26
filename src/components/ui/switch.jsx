"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";



const Switch = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SwitchPrimitives.Root




    {...props}
    ref={ref}>
    
    <SwitchPrimitives.Thumb />


    
    
  </SwitchPrimitives.Root>
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };