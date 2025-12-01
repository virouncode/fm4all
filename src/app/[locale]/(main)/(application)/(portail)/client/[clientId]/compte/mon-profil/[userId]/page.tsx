import { getSession } from "@/lib/auth-session";
import { getUserById } from "@/lib/queries/users/getUsers";
import { UpdateUserType } from "@/zod-schemas/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import UpdateUserForm from "./UpdateUserForm";

const page = async ({
  params,
}: {
  params: Promise<{ clientId: string; userId: string }>;
}) => {
  const { clientId, userId } = await params;
  const currentSession = await getSession();
  const currentUser = currentSession?.user;
  if (!currentUser || currentUser.id !== userId) {
    redirect("/unauthorized");
  }

  const user = await getUserById(userId);

  const errorComponent: ReactNode = (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b p-2">
        <h1 className="text-center text-xl font-bold">
          Utilisateur introuvable
        </h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez votre profil
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails de votre profil ci-dessous
              </p>
            </div>
            <div>Impossible de trouver votre profil utilisateur</div>
          </div>
        </div>
      </div>
    </main>
  );

  if (!user) return errorComponent;

  const defaultValues: UpdateUserType = {
    id: user.id ?? "",
    name: user.name ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    image: user.image ?? undefined,
    phone: user.phone ?? "",
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Mon profil</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex justify-center p-6">
          <div className="w-full max-w-3xl pb-8">
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold tracking-tight">
                Modifiez votre profil
              </h2>
              <p className="text-muted-foreground text-sm">
                Modifiez les détails de votre profil ci-dessous
              </p>
            </div>
            <UpdateUserForm
              defaultValues={defaultValues}
              clientId={parseInt(clientId)}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
