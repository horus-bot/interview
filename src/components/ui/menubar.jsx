"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";



function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef(


  ({ className, ...props }, ref) =>
  <MenubarPrimitive.Root
    ref={ref}




    {...props} />

);
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef(


  ({ className, ...props }, ref) =>
  <MenubarPrimitive.Trigger
    ref={ref}




    {...props} />

);
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef(




  ({ className, inset, children, ...props }, ref) =>
  <MenubarPrimitive.SubTrigger
    ref={ref}





    {...props}>
    
    {children}
    <ChevronRight style={{ marginLeft: "auto", height: "1rem", width: "1rem" }} />
  </MenubarPrimitive.SubTrigger>
);
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef(


  ({ className, ...props }, ref) =>
  <MenubarPrimitive.SubContent
    ref={ref}




    {...props} />

);
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef(



  (
  { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
  ref) =>

  <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}




      {...props} />
    
    </MenubarPrimitive.Portal>

);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef(




  ({ className, inset, ...props }, ref) =>
  <MenubarPrimitive.Item
    ref={ref}





    {...props} />

);
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef(


  ({ className, children, checked, ...props }, ref) =>
  <MenubarPrimitive.CheckboxItem
    ref={ref}




    checked={checked}
    {...props}>
    
    <span style={{ position: "absolute", left: "0.5rem", display: "flex", height: "0.875rem", width: "0.875rem", alignItems: "center", justifyContent: "center" }}>
      <MenubarPrimitive.ItemIndicator>
        <Check style={{ height: "1rem", width: "1rem" }} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
);
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef(


  ({ className, children, ...props }, ref) =>
  <MenubarPrimitive.RadioItem
    ref={ref}




    {...props}>
    
    <span style={{ position: "absolute", left: "0.5rem", display: "flex", height: "0.875rem", width: "0.875rem", alignItems: "center", justifyContent: "center" }}>
      <MenubarPrimitive.ItemIndicator>
        <Circle style={{ height: "0.5rem", width: "0.5rem", fill: "currentColor" }} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
);
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef(




  ({ className, inset, ...props }, ref) =>
  <MenubarPrimitive.Label
    ref={ref}





    {...props} />

);
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef(


  ({ className, ...props }, ref) =>
  <MenubarPrimitive.Separator
    ref={ref}

    {...props} />

);
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}) => {
  return (
    <span




      {...props} />);


};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut };