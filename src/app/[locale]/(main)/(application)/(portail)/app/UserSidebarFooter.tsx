"use client";

import { ModeToggle } from "@/components/theme/mode-toggle";
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
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { getDocumentAction } from "@/server/actions/documentsActions";
import { useAppStore } from "@/stores/application/appStore";
import { User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserSidebarFooter() {
  const user = useAppStore((state) => state.user);
  const entreprise = useAppStore((state) => state.entreprise);
  const router = useRouter();
  const { state, isMobile } = useSidebar();

  const collapsed = state === "collapsed" && !isMobile;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  // Générer l'URL présignée pour l'avatar
  useEffect(() => {
    if (!user?.avatarId || !entreprise?.id) {
      setAvatarUrl(null);
      return;
    }

    setIsLoadingAvatar(true);

    // 1. Récupérer les données complètes du document avatar
    getDocumentAction({ documentId: user.avatarId })
      .then(async (result) => {
        if (result?.data?.document) {
          const doc = result.data.document;

          // 2. Générer l'URL présignée
          if (doc.storageKey && doc.storageProvider === "s3") {
            const url = await getPresignedReadUrl({
              key: doc.storageKey,
              proprietaireEntrepriseId: entreprise.id,
            });
            setAvatarUrl(url || null);
          }
        }
      })
      .catch(() => {
        setAvatarUrl(null);
      })
      .finally(() => {
        setIsLoadingAvatar(false);
      });
  }, [user?.avatarId, entreprise?.id]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            toast.success("Vous avez été déconnecté avec succès");
          },
        },
      });
    } catch {
      // silently ignore sign out errors
    }
  };

  const initials =
    `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();
  const fullName = `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim();

  return (
    <SidebarMenu>
      {collapsed && (
        <SidebarMenuItem className="flex justify-center">
          <ModeToggle variant="ghost" />
        </SidebarMenuItem>
      )}
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className={collapsed ? "justify-center rounded-full px-2" : ""}
            >
              <Avatar className={collapsed ? "mx-auto h-9 w-9" : "h-8 w-8"}>
                {avatarUrl && !isLoadingAvatar ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={`${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim()}
                  />
                ) : null}
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
            {/* <DropdownMenuItem
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
            </DropdownMenuItem> */}

            <DropdownMenuItem onClick={handleSignOut}>
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
