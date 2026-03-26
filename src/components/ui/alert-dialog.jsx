"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(


  ({ style, ...props }, ref) =>
  <AlertDialogPrimitive.Overlay
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
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(


  ({ style, ...props }, ref) =>
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
        width: "min(32rem, calc(100vw - 2rem))",
        display: "grid",
        gap: "1rem",
        border: "1px solid hsl(var(--border))",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        ...style
      }}
      {...props} />
    
  </AlertDialogPortal>
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
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


AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  style,
  ...props
}) =>
<div

  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.5rem",
    flexWrap: "wrap",
    ...style
  }}
  {...props} />;


AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <AlertDialogPrimitive.Title
    ref={ref}

    style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, ...style }}
    {...props} />

);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <AlertDialogPrimitive.Description
    ref={ref}

    style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", margin: 0, ...style }}
    {...props} />

);
AlertDialogDescription.displayName =
AlertDialogPrimitive.Description.displayName;

const actionBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  height: "2.5rem",
  padding: "0 1rem",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer"
};

const AlertDialogAction = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <AlertDialogPrimitive.Action
    ref={ref}

    style={{
      ...actionBaseStyle,
      border: "none",
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      ...style
    }}
    {...props} />

);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <AlertDialogPrimitive.Cancel
    ref={ref}

    style={{
      ...actionBaseStyle,
      border: "1px solid hsl(var(--border))",
      backgroundColor: "transparent",
      color: "hsl(var(--foreground))",
      ...style
    }}
    {...props} />

);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel };