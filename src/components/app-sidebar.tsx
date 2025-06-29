//import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { NavItem } from "@/app/(admin)/admin/(admin)/config"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.

export function AppSidebar({navItems}: {navItems : NavItem[] }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((navItem) => {
                 const Icon = navItem.icon; // 👈 Extract icon as a component
                 return (
                   <SidebarMenuItem key={navItem.name}>
                     <SidebarMenuButton asChild>
                       <a href={navItem.href} className="flex items-center gap-2">
                         <Icon className="h-5 w-5" />
                         <span>{navItem.name}</span>
                       </a>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                 );
})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
