"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";



const Slider = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SliderPrimitive.Root
    ref={ref}




    {...props}>
    
    <SliderPrimitive.Track style={{ position: "relative", height: "0.5rem", width: "100%", flexGrow: "1", overflow: "hidden", borderRadius: "9999px" }}>
      <SliderPrimitive.Range style={{ position: "absolute", height: "100%" }} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb style={{ display: "block", height: "1.25rem", width: "1.25rem", borderRadius: "9999px", borderWidth: "2px", transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", outline: "2px solid transparent", outlineOffset: "2px", boxShadow: "0 0 0 0px #fff,   0 0 0 calc(2px + 0px) rgb(59,130,246,0.5), 0 0 #0000", pointerEvents: "none", opacity: "0.5" }} />
  </SliderPrimitive.Root>
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };