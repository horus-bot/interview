"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

const Label = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <LabelPrimitive.Root
    ref={ref}
    style={{
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1,
      color: 'hsl(var(--foreground))',
      ...style
    }}
    {...props} />

);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };