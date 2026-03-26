"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";



const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(


  ({ style, ...props }, ref) =>
  <ToastPrimitives.Viewport
    ref={ref}
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      maxHeight: "100vh",
      width: "100%",
      maxWidth: "420px",
      padding: "1rem",
      boxSizing: "border-box",
      pointerEvents: "none",
      ...style
    }}
    {...props} />

);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef(




  ({ variant = "default", style, ...props }, ref) => {
    const destructive = variant === "destructive";

    return (
      <ToastPrimitives.Root
        ref={ref}
        style={{
          pointerEvents: "auto",
          position: "relative",
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
          borderRadius: "0.75rem",
          border: `1px solid ${destructive ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
          backgroundColor: destructive ? "hsl(var(--destructive))" : "hsl(var(--background))",
          color: destructive ? "hsl(var(--destructive-foreground))" : "hsl(var(--foreground))",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          padding: "1rem 2.5rem 1rem 1rem",
          overflow: "hidden",
          ...style
        }}
        {...props} />);


  });
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(


  ({ style, ...props }, ref) =>
  <ToastPrimitives.Action
    ref={ref}
    style={{
      display: "inline-flex",
      height: "2rem",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.5rem",
      border: "1px solid hsl(var(--border))",
      backgroundColor: "transparent",
      padding: "0 0.75rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "inherit",
      cursor: "pointer",
      ...style
    }}
    {...props} />

);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(


  ({ style, ...props }, ref) =>
  <ToastPrimitives.Close
    ref={ref}
    style={{
      position: "absolute",
      right: "0.5rem",
      top: "0.5rem",
      border: "none",
      background: "transparent",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      cursor: "pointer",
      opacity: 0.8,
      color: "inherit",
      ...style
    }}
    toast-close=""
    {...props}>
    
    <X size={16} />
  </ToastPrimitives.Close>
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(


  ({ style, ...props }, ref) =>
  <ToastPrimitives.Title
    ref={ref}
    style={{
      fontSize: "0.875rem",
      fontWeight: 700,
      lineHeight: 1.2,
      ...style
    }}
    {...props} />

);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(


  ({ style, ...props }, ref) =>
  <ToastPrimitives.Description
    ref={ref}
    style={{
      fontSize: "0.875rem",
      opacity: 0.9,
      lineHeight: 1.4,
      ...style
    }}
    {...props} />

);
ToastDescription.displayName = ToastPrimitives.Description.displayName;





export {


  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction };