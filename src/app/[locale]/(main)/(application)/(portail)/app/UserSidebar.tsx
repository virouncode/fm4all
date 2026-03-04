"use client";

import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Fm4allSidebarBrand from "./Fm4allSidebarBrand";
import UserNavItems from "./UserNavItems";
import UserSidebarFooter from "./UserSidebarFooter";
import UserSidebarHeader from "./UserSidebarHeader";

function SidebarTopBar() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <div className="flex items-center gap-1 px-1 pt-1">
      <SidebarTrigger />
      {!collapsed && <ModeToggle variant="ghost" />}
    </div>
  );
}

export default function UserSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTopBar />
      <Fm4allSidebarBrand />
      <UserSidebarHeader />
      <SidebarContent className="overflow-y-auto">
        <UserNavItems />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <UserSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
