"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";



const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <SelectPrimitive.Trigger
    ref={ref}




    {...props}>
    
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ height: "1rem", width: "1rem", opacity: "0.5" }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SelectPrimitive.ScrollUpButton
    ref={ref}




    {...props}>
    
    <ChevronUp style={{ height: "1rem", width: "1rem" }} />
  </SelectPrimitive.ScrollUpButton>
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SelectPrimitive.ScrollDownButton
    ref={ref}




    {...props}>
    
    <ChevronDown style={{ height: "1rem", width: "1rem" }} />
  </SelectPrimitive.ScrollDownButton>
);
SelectScrollDownButton.displayName =
SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(


  ({ className, children, position = "popper", ...props }, ref) =>
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}






      position={position}
      {...props}>
      
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport>




        
        
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SelectPrimitive.Label
    ref={ref}

    {...props} />

);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <SelectPrimitive.Item
    ref={ref}




    {...props}>
    
    <span style={{ position: "absolute", left: "0.5rem", display: "flex", height: "0.875rem", width: "0.875rem", alignItems: "center", justifyContent: "center" }}>
      <SelectPrimitive.ItemIndicator>
        <Check style={{ height: "1rem", width: "1rem" }} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(


  ({ className, ...props }, ref) =>
  <SelectPrimitive.Separator
    ref={ref}

    {...props} />

);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton };