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
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { AuthUser } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { User2 } from "lucide-react";

type AdminSidebarFooterProps = {
  currentUser: AuthUser;
};

export default function AdminSidebarFooter({
  currentUser,
}: AdminSidebarFooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (segment: string) => pathname.includes(segment);
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
  const initials =
    `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="sidebar-footer-button">
              <Avatar>
                {currentUser.image && (
                  <AvatarImage
                    src={currentUser.image}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                  />
                )}
                <AvatarFallback>
                  <div className="flex h-full w-full items-center justify-center">
                    {initials ? (
                      <span className="text-primary text-xs font-bold">
                        {initials}
                      </span>
                    ) : (
                      <User2 className="h-4 w-4" />
                    )}
                  </div>
                </AvatarFallback>
              </Avatar>
              <span className="sidebar-footer-text">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem
              className={
                isActive("mon-profil")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : ""
              }
              asChild
            >
              <Link
                href={{
                  pathname: "/admin/[userId]/compte/mon-profil",
                  params: { userId: currentUser.id },
                }}
              >
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                isActive("mon-equipe")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : ""
              }
              asChild
            >
              <Link
                href={{
                  pathname: "/admin/[userId]/compte/mon-equipe",
                  params: { userId: currentUser.id },
                }}
              >
                Mon équipe
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
