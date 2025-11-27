import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import ClientSidebar from "./ClientSidebar";

export default async function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen w-full overflow-hidden">
        <ClientSidebar clientId={Number(clientId)} />
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Header sticky */}
          <header className="bg-background sticky top-0 z-10 border-b p-4">
            <h1 className="text-xl font-semibold">Portail Client</h1>
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
