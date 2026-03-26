"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";



const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(


  ({ className, ...props }, ref) =>
  <DialogPrimitive.Overlay
    ref={ref}




    {...props} />

);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}




      {...props}>
      
      {children}
      <DialogPrimitive.Close style={{ position: "absolute", right: "1rem", top: "1rem", borderRadius: "0.125rem", opacity: "1", transitionProperty: "opacity", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", outline: "2px solid transparent", outlineOffset: "2px", boxShadow: "0 0 0 0px #fff,   0 0 0 calc(2px + 0px) rgb(59,130,246,0.5), 0 0 #0000", pointerEvents: "none" }}>
        <X style={{ height: "1rem", width: "1rem" }} />
        <span style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" }}>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}) =>
<div




  {...props} />;


DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}) =>
<div




  {...props} />;


DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(


  ({ className, ...props }, ref) =>
  <DialogPrimitive.Title
    ref={ref}




    {...props} />

);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(


  ({ className, ...props }, ref) =>
  <DialogPrimitive.Description
    ref={ref}

    {...props} />

);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription };