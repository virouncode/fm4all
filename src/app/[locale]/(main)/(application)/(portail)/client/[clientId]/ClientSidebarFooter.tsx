"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { User2 } from "lucide-react";

type ClientSidebarFooterProps = {
  clientId: number;
};

export default function ClientSidebarFooter({
  clientId,
}: ClientSidebarFooterProps) {
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            toast({
              title: "Déconnexion réussie",
              description: "Vous avez été déconnecté avec succès",
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="sidebar-footer-button">
              <Avatar>
                <AvatarImage src="/img/alice_dubois.webp" />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              <span className="sidebar-footer-text">Alice Dubois</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem>
              <Link
                href={{
                  pathname: "/client/[clientId]/compte/mon-profil",
                  params: { clientId },
                }}
              >
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={{
                  pathname: "/client/[clientId]/compte/mon-equipe",
                  params: { clientId },
                }}
              >
                Mon équipe
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={{
                  pathname: "/client/[clientId]/compte/notifications",
                  params: { clientId },
                }}
              >
                Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={{
                  pathname: "/client/[clientId]/compte/preferences",
                  params: { clientId },
                }}
              >
                Préférences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <p onClick={handleSignOut}>Deconnexion</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
