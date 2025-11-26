"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ClientNavItems from "./ClientNavItems";
import ClientSidebarFooter from "./ClientSidebarFooter";

type ClientSidebarProps = {
  clientId: number;
};

export default function ClientSidebar({ clientId }: ClientSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarTrigger />
      <SidebarContent className="overflow-y-auto">
        <ClientNavItems />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <ClientSidebarFooter clientId={clientId} />
      </SidebarFooter>
    </Sidebar>
  );
}
