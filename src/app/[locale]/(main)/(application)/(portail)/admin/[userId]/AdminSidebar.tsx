"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthUser } from "@/server/auth/auth";
import AdminNavItems from "./AdminNavItems";
import AdminSidebarFooter from "./AdminSidebarFooter";

type AdminSidebarProps = {
  currentUser: AuthUser;
};

export default function AdminSidebar({ currentUser }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
      <SidebarContent className="overflow-y-auto">
        <AdminNavItems userId={currentUser.id} />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <AdminSidebarFooter currentUser={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
