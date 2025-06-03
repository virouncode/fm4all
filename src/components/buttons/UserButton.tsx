"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { User } from "better-auth";
import { UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Dispatch, SetStateAction } from "react";

type UserButtonProps = {
  setIsMobileNavOpen?: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

const UserButton = ({ setIsMobileNavOpen, className }: UserButtonProps) => {
  const t = useTranslations("auth");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User & {
    role: string;
    fournisseurId?: number;
    clientId?: number;
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            toast({
              title: t("deconnexion-reussie"),
              description: t("vous-avez-ete-deconnecte-avec-succes"),
              variant: "default",
            });
          },
        },
      });
    } catch (err) {
      console.error("Erreur lors de la deconnexion:", err);
    }
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={`cursor-pointer`}>
        <Button
          title={t("connexion")}
          variant="outline"
          className={`flex justify-center items-center rounded-full ${!user?.image ? "p-2" : ""} ${className}`}
          size="icon"
          asChild
        >
          {session ? (
            user?.image ? (
              <Image
                src={user.image}
                alt="avatar-utilisateur"
                width={32}
                height={32}
                className={`${user.role === "admin" ? "object-cover" : "object-contain"}`}
              />
            ) : (
              <UserCheck />
            )
          ) : (
            <UserX />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* {session && user?.role && (
          <DropdownMenuItem
            asChild
            onClick={
              setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined
            }
          >
            {user?.role === "admin" ? (
              <Link
                href={{
                  pathname: "/admin/[adminId]",
                  params: { adminId: user.id },
                }}
                className="cursor-default !text-base"
              >
                {t("mon-espace")}
              </Link>
            ) : user?.role === "client" ? (
              <Link
                href={{
                  pathname: "/client/[clientId]",
                  params: { clientId: user.clientId ?? 0 },
                }}
                className="cursor-default !text-base"
              >
                {t("mon-espace")}
              </Link>
            ) : (
              <Link
                href={{
                  pathname: "/fournisseur/[fournisseurId]/dashboard",
                  params: { fournisseurId: user.fournisseurId ?? 0 },
                }}
                className="cursor-default !text-base"
              >
                {t("mon-espace")}
              </Link>
            )}
          </DropdownMenuItem>
        )} */}
        <DropdownMenuItem
          asChild
          onClick={
            setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined
          }
        >
          {session ? (
            <p onClick={handleSignOut} className="!text-base">
              {t("deconnexion")}
            </p>
          ) : (
            <Link href="/auth/signin" className="cursor-default !text-base">
              {t("connexion")}
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
