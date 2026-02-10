"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/stores/application/appStore";
import UserNavItems from "./UserNavItems";
import UserSidebarFooter from "./UserSidebarFooter";
import UserSidebarHeader from "./UserSidebarHeader";
import Fm4allSidebarBrand from "./Fm4allSidebarBrand";

export default function UserSidebar() {
  const user = useAppStore((state) => state.user);
  console.log("user", user);

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
