"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <AccordionPrimitive.Item
    ref={ref}

    style={{
      borderBottom: "1px solid hsl(var(--border))",
      ...style
    }}
    {...props} />

);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(


  ({ className, children, style, ...props }, ref) =>
  <AccordionPrimitive.Header style={{ display: "flex" }}>
    <AccordionPrimitive.Trigger
      ref={ref}

      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "1rem 0",
        fontWeight: 600,
        color: "hsl(var(--foreground))",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        ...style
      }}
      {...props}>
      
      {children}
      <ChevronDown size={16} style={{ opacity: 0.8, flexShrink: 0 }} />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(


  ({ className, children, style, ...props }, ref) =>
  <AccordionPrimitive.Content
    ref={ref}

    style={{
      overflow: "hidden",
      fontSize: "0.875rem",
      color: "hsl(var(--muted-foreground))",
      ...style
    }}
    {...props}>
    
    <div style={{ paddingBottom: "1rem" }}>{children}</div>
  </AccordionPrimitive.Content>
);

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };