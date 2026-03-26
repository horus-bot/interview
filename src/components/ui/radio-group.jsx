"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";



const RadioGroup = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root

        {...props}
        ref={ref} />);


  });
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}




        {...props}>
        
      <RadioGroupPrimitive.Indicator style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Circle style={{ height: "0.625rem", width: "0.625rem", fill: "currentColor", color: "currentColor" }} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>);

  });
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };