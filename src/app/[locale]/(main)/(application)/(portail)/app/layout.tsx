import { AppProvider } from "@/components/provider/AppProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { roleEntrepriseCodes } from "@/constants/codeTables";
import { getSession } from "@/server/auth/get-session";
import { bootstrapUser } from "@/server/queries/bootstrap.query";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { cookies } from "next/headers";
import { PostureIndicator } from "./PostureIndicator";
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
    roleClientAdhesion: bootstrap.roleClientAdhesion,
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
            <div className="fixed right-3 top-3 z-50 md:hidden">
              <SidebarTrigger />
            </div>
            <PostureIndicator />
            <div className="flex-1 overflow-y-auto overscroll-none">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
};

export default AppLayout;
