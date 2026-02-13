"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Fm4allSidebarBrand from "./Fm4allSidebarBrand";
import UserNavItems from "./UserNavItems";
import UserSidebarFooter from "./UserSidebarFooter";
import UserSidebarHeader from "./UserSidebarHeader";

export default function UserSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
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
