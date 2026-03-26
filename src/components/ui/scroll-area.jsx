"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";



const ScrollArea = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <ScrollAreaPrimitive.Root
    ref={ref}

    {...props}>
    
    <ScrollAreaPrimitive.Viewport style={{ height: "100%", width: "100%", borderRadius: "inherit" }}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef(


  ({ className, orientation = "vertical", ...props }, ref) =>
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}








    {...props}>
    
    <ScrollAreaPrimitive.ScrollAreaThumb style={{ position: "relative", flex: "1 1 0%", borderRadius: "9999px" }} />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };