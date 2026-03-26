"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";



const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef(




  ({ className, inset, children, ...props }, ref) =>
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}





    {...props}>
    
    {children}
    <ChevronRight style={{ marginLeft: "auto" }} />
  </DropdownMenuPrimitive.SubTrigger>
);
DropdownMenuSubTrigger.displayName =
DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef(


  ({ className, ...props }, ref) =>
  <DropdownMenuPrimitive.SubContent
    ref={ref}




    {...props} />

);
DropdownMenuSubContent.displayName =
DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef(


  ({ className, sideOffset = 4, ...props }, ref) =>
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}




      {...props} />
    
  </DropdownMenuPrimitive.Portal>
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef(




  ({ className, inset, ...props }, ref) =>
  <DropdownMenuPrimitive.Item
    ref={ref}





    {...props} />

);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef(


  ({ className, children, checked, ...props }, ref) =>
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}




    checked={checked}
    {...props}>
    
    <span style={{ position: "absolute", left: "0.5rem", display: "flex", height: "0.875rem", width: "0.875rem", alignItems: "center", justifyContent: "center" }}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Check style={{ height: "1rem", width: "1rem" }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);
DropdownMenuCheckboxItem.displayName =
DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <DropdownMenuPrimitive.RadioItem
    ref={ref}




    {...props}>
    
    <span style={{ position: "absolute", left: "0.5rem", display: "flex", height: "0.875rem", width: "0.875rem", alignItems: "center", justifyContent: "center" }}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle style={{ height: "0.5rem", width: "0.5rem", fill: "currentColor" }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef(




  ({ className, inset, ...props }, ref) =>
  <DropdownMenuPrimitive.Label
    ref={ref}





    {...props} />

);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef(


  ({ className, ...props }, ref) =>
  <DropdownMenuPrimitive.Separator
    ref={ref}

    {...props} />

);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    <span

      {...props} />);


};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup };