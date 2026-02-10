"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { User } from "better-auth";
import { UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Dispatch, SetStateAction } from "react";
import { ObfuscatedLink } from "../links/ObfuscatedLink";

type UserButtonProps = {
  setIsMobileNavOpen?: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

const UserButton = ({ setIsMobileNavOpen, className }: UserButtonProps) => {
  const t = useTranslations("auth");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User | undefined;

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
      <DropdownMenuTrigger className={`cursor-pointer`} asChild>
        <Button
          className={`flex items-center justify-center rounded-full ${!user?.image ? "p-2" : ""} ${className}`}
          aria-label="user menu"
          variant="outline"
          title={t("connexion")}
          size="icon"
        >
          <Avatar>
            {session && user?.image ? (
              <AvatarImage src={user.image} alt="avatar-utilisateur" />
            ) : (
              <AvatarFallback>
                {session ? <UserCheck /> : <UserX />}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {session && user && (
          <DropdownMenuItem
            asChild
            onClick={
              setIsMobileNavOpen ? () => setIsMobileNavOpen(false) : undefined
            }
          >
            <ObfuscatedLink href="/app" className="cursor-default !text-base">
              {t("mon-espace")}
            </ObfuscatedLink>
          </DropdownMenuItem>
        )}
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
            <ObfuscatedLink
              href="/auth/login"
              className="cursor-default !text-base"
            >
              {t("connexion")}
            </ObfuscatedLink>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
