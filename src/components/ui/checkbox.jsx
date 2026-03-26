"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";



const Checkbox = React.forwardRef(


  ({ className, ...props }, ref) =>
  <CheckboxPrimitive.Root
    ref={ref}




    {...props}>
    
    <CheckboxPrimitive.Indicator>
      
      
      <Check style={{ height: "1rem", width: "1rem" }} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };