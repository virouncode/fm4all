import { SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/server/auth/get-session";
import { getUserById } from "@/server/queries_a_classer/users/getUsers";
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
  // 1) Auth & droits
  const currentSession = await getSession();
  if (!currentSession?.user) {
    throw new Error("Utilisateur non authentifié");
  }

  const authUser = currentSession.user;

  // 2) User “réel” depuis la BDD
  const dbUser = await getUserById(authUser.id);
  if (!dbUser) {
    throw new Error("Utilisateur introuvable");
  }

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen w-full overflow-hidden">
        <ClientSidebar clientId={parseInt(clientId)} currentUser={dbUser} />
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
