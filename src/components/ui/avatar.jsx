"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";



const Avatar = React.forwardRef(


  ({ className, ...props }, ref) =>
  <AvatarPrimitive.Root
    ref={ref}




    {...props} />

);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(


  ({ className, ...props }, ref) =>
  <AvatarPrimitive.Image
    ref={ref}

    {...props} />

);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(


  ({ className, ...props }, ref) =>
  <AvatarPrimitive.Fallback
    ref={ref}




    {...props} />

);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };