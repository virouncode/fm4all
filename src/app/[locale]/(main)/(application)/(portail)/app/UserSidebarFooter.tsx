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
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useAppStore } from "@/stores/application/appStore";
import { User2 } from "lucide-react";

export default function UserSidebarFooter() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();

  const collapsed = state === "collapsed";

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
    `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={collapsed ? "justify-center rounded-full px-2" : ""}
            >
              <Avatar className={collapsed ? "mx-auto h-9 w-9" : "h-8 w-8"}>
                {user?.avatarId && (
                  <AvatarImage
                    src={user.avatarId}
                    alt={`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim()}
                  />
                )}
                <AvatarFallback className="flex items-center justify-center">
                  {initials ? (
                    <span className="text-primary text-xs font-bold">
                      {initials}
                    </span>
                  ) : (
                    <User2 className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              {/* En mode collapsed, on masque le texte */}
              {!collapsed && <span className="truncate">{fullName}</span>}
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
              <Link href={{ pathname: "/app/compte/mon-profil" }}>
                Mon profil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleSignOut}>
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
