import { AppProvider } from "@/components/provider/AppProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { roleEntrepriseCodes } from "@/constants/codeTables";
import { getSession } from "@/server/auth/get-session";
import { bootstrapUser } from "@/server/queries/bootstrap.query";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { cookies } from "next/headers";
import UserSidebar from "./UserSidebar";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    //TODO : rediriger vers page de login
    return <div>Not authenticated</div>;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("fm4all:postureActive")?.value;

  const postureActive =
    cookieValue &&
    roleEntrepriseCodes.includes(cookieValue as RoleEntrepriseType)
      ? (cookieValue as RoleEntrepriseType)
      : undefined;

  const bootstrap = await bootstrapUser(user.id, postureActive);
  if (!bootstrap) {
    //TODO : rediriger vers page d'adhesion
    return <div>No entreprise adhesion found</div>;
  }

  const payload = {
    user: {
      id: user.id,
      prenom: user.prenom ?? "",
      nom: user.nom ?? "",
      email: user.email,
      avatarId: user.avatarId ?? null,
    },
    entreprise: bootstrap.entreprise,
    roleAdhesion: bootstrap.roleAdhesion,
    rolesEntreprise: bootstrap.rolesEntreprise,
    postureActive: bootstrap.postureActive,
    rolePlateformeAdhesion: bootstrap.rolePlateformeAdhesion,
  };

  return (
    <AppProvider bootstrap={payload}>
      <SidebarProvider>
        <div className="bg-background flex h-screen w-full overflow-hidden">
          <UserSidebar />
          <main className="flex h-full flex-1 flex-col overflow-hidden">
            {/* Header sticky
            <header className="bg-background sticky top-0 z-10 border-b p-4">
              <h1 className="text-xl font-semibold">Portail Administrateur</h1>
            </header> */}
            <div className="flex-1 overflow-y-auto overscroll-none">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
};

export default AppLayout;
