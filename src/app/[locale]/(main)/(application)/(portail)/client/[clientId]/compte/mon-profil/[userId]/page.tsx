import { getSession } from "@/server/auth/get-session";
import { getUserById } from "@/server/queries_a_classer/users/getUsers";
import { UpdateUserFormType } from "@/zod-schemas/user";
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

  const defaultValues: UpdateUserFormType = {
    id: user.id ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    avatarAttachment: user.image
      ? {
          url: user.image,
          mimeType: "image/*",
          filename: "avatar",
          size: 0,
        }
      : null,
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
