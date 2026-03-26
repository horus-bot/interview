"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef(


  ({ style, ...props }, ref) =>
  <SheetPrimitive.Overlay
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      backgroundColor: "rgba(0,0,0,0.8)",
      ...style
    }}
    {...props}
    ref={ref} />

);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;








const SheetContent = React.forwardRef(


  ({ side = "right", style, children, ...props }, ref) =>
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 50,
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        padding: "1.5rem",
        width: side === "left" || side === "right" ? "min(24rem, 85vw)" : "100%",
        height: side === "left" || side === "right" ? "100%" : "auto",
        top: side === "bottom" ? "auto" : 0,
        bottom: side === "top" ? "auto" : 0,
        left: side === "right" ? "auto" : 0,
        right: side === "left" ? "auto" : 0,
        ...style
      }}
      {...props}>
      
      {children}
      <SheetPrimitive.Close
        style={{
          position: "absolute",
          right: "1rem",
          top: "1rem",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          opacity: 0.8,
          color: "inherit"
        }}>
        
        <X size={16} />
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  style,
  ...props
}) =>
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    textAlign: "left",
    ...style
  }}
  {...props} />;


SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  style,
  ...props
}) =>
<div
  style={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: "0.5rem",
    ...style
  }}
  {...props} />;


SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef(


  ({ style, ...props }, ref) =>
  <SheetPrimitive.Title
    ref={ref}
    style={{ fontSize: "1.125rem", fontWeight: 700, color: "hsl(var(--foreground))", ...style }}
    {...props} />

);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(


  ({ style, ...props }, ref) =>
  <SheetPrimitive.Description
    ref={ref}
    style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", ...style }}
    {...props} />

);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription };