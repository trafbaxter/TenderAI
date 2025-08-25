import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const SidebarProvider = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className="relative flex" {...props}>
      {React.cloneElement(children, { isOpen, setIsOpen })}
    </div>
  )
}

const Sidebar = React.forwardRef(({ className, children, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-screen w-64 flex-col bg-background border-r transition-transform duration-200 md:translate-x-0",
      !isOpen && "-translate-x-full",
      className
    )}
    {...props}>
    {children}
  </div>
))
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className={cn("md:hidden", className)}
    {...props}>
    <Menu className="h-5 w-5" />
  </Button>
))
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-4", className)}
    {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto", className)}
    {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4", className)}
    {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-medium text-muted-foreground", className)}
    {...props} />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1", className)}
    {...props} />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("space-y-1", className)}
    {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props} />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}