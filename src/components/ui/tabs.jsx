"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";



const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(


  ({ className, ...props }, ref) =>
  <TabsPrimitive.List
    ref={ref}




    {...props} />

);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(


  ({ className, ...props }, ref) =>
  <TabsPrimitive.Trigger
    ref={ref}




    {...props} />

);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(


  ({ className, ...props }, ref) =>
  <TabsPrimitive.Content
    ref={ref}




    {...props} />

);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };