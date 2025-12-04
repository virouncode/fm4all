"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthUser } from "@/lib/auth";
import ClientNavItems from "./ClientNavItems";
import ClientSidebarFooter from "./ClientSidebarFooter";
import { UserRoleType } from "@/zod-schemas/enums";

type ClientSidebarProps = {
  clientId: number;
  currentUser: AuthUser;
};

export default function ClientSidebar({
  clientId,
  currentUser,
}: ClientSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
      <SidebarContent className="overflow-y-auto">
        <ClientNavItems currentRole={currentUser.role as UserRoleType} />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <ClientSidebarFooter clientId={clientId} currentUser={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
