"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";











const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef(







  (
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  },
  ref) =>
  {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile ?
      setOpenMobile((open) => !open) :
      setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT && (
        event.metaKey || event.ctrlKey))
        {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style
            }
            }




            ref={ref}
            {...props}>
            
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>);

  }
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef(







  (
  {
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  },
  ref) =>
  {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div




          ref={ref}
          {...props}>
          
          {children}
        </div>);

    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"

            style={
            { width: "undefined", padding: "0px", display: "none",
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE
            }
            }
            side={side}>
            
            <div style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column" }}>{children}</div>
          </SheetContent>
        </Sheet>);

    }

    return (
      <div
        ref={ref}
        style={{ display: "none" }}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}>
        
        {/* This is what handles the sidebar gap on desktop */}
        <div />







        
        
        <div











          {...props}>
          
          <div
            data-sidebar="sidebar"
            style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", borderRadius: "0.5rem", borderWidth: "1px", boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 3px 0 rgb(0,0,0,0.1), 0 1px 2px -1px rgb(0,0,0,0.1)" }}>
            
            {children}
          </div>
        </div>
      </div>);

  }
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef(


  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"

        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}>
        
      <PanelLeft />
      <span style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" }}>Toggle Sidebar</span>
    </Button>);

  });
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef(


  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"









        {...props} />);


  });
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}





        {...props} />);


  });
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"




        {...props} />);


  });
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="header"

        {...props} />);


  });
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="footer"

        {...props} />);


  });
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        data-sidebar="separator"

        {...props} />);


  });
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="content"




        {...props} />);


  });
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"

        {...props} />);


  });
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef(


  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"





        {...props} />);


  });
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef(


  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"







        {...props} />);


  });
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef(


  ({ className, ...props }, ref) =>
  <div
    ref={ref}
    data-sidebar="group-content"

    {...props} />

);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef(


  ({ className, ...props }, ref) =>
  <ul
    ref={ref}
    data-sidebar="menu"

    {...props} />

);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(


  ({ className, ...props }, ref) =>
  <li
    ref={ref}
    data-sidebar="menu-item"

    {...props} />

);
SidebarMenuItem.displayName = "SidebarMenuItem";




function sidebarMenuButtonVariants(opts)


{
  const variant = opts?.variant ?? "default";
  const size = opts?.size ?? "default";

  return cn(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    variant === "outline" ?
    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]" :
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    size === "sm" ?
    "h-7 text-xs" :
    size === "lg" ?
    "h-12 text-sm group-data-[collapsible=icon]:!p-0" :
    "h-8 text-sm"
  );
}

const SidebarMenuButton = React.forwardRef(









  (
  {
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  },
  ref) =>
  {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button =
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}

      {...props} />;



    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip} />
        
      </Tooltip>);

  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef(





  ({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="menu-action"












        {...props} />);


  });
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef(


  ({ className, ...props }, ref) =>
  <div
    ref={ref}
    data-sidebar="menu-badge"









    {...props} />

);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef(




  ({ className, showIcon = false, ...props }, ref) => {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
      return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"

        {...props}>
        
      {showIcon &&
        <Skeleton
          style={{ borderRadius: "0.375rem" }}
          data-sidebar="menu-skeleton-icon" />

        }
      <Skeleton

          data-sidebar="menu-skeleton-text"
          style={
          { height: "1rem", maxWidth: "undefined", flex: "1 1 0%",
            "--skeleton-width": width
          }
          } />
        
    </div>);

  });
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef(


  ({ className, ...props }, ref) =>
  <ul
    ref={ref}
    data-sidebar="menu-sub"





    {...props} />

);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef(


  ({ ...props }, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef(






  ({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref}
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}








        {...props} />);


  });
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar };