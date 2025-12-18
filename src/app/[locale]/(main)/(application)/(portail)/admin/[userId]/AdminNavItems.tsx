"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Building2,
  ChevronRight,
  Compass,
  FileSignature,
  FileText,
  Handshake,
  Target,
  Ticket,
  Wrench,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AdminNavItemsProps = {
  userId: string;
};

export default function AdminNavItems({ userId }: AdminNavItemsProps) {
  const pathname = usePathname();

  const isActive = (segment: string) => pathname.includes(segment);

  const [ticketsOpen, setTicketsOpen] = useState(isActive("/tickets/"));
  const [interOpen, setInterOpen] = useState(isActive("/interventions/"));
  const [devisOpen, setDevisOpen] = useState(isActive("/devis/"));
  const [contrOpen, setContrOpen] = useState(isActive("/contrats/"));
  const [clientsOpen, setClientsOpen] = useState(isActive("/clients/"));
  const [fournisseursOpen, setFournisseursOpen] = useState(
    isActive("/fournisseurs/"),
  );

  return (
    <div className="flex flex-col">
      <SidebarGroup>
        <SidebarGroupLabel asChild className="mt-2 mb-6 w-full">
          <div className="flex w-full items-center justify-center">
            <Link href="/" title="Accueil">
              <div className="relative h-[23px] w-[100px]">
                <Image
                  src="/img/logo_full.webp"
                  alt="fm4all-Logo"
                  fill
                  sizes="100px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </SidebarGroupLabel>
      </SidebarGroup>
      {/* ----------- DASHBOARD ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(`/admin/${userId}`)}
              >
                <Link
                  href={{
                    pathname: "/admin/[userId]",
                    params: { userId },
                  }}
                >
                  <Compass className="h-4 w-4" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- TICKETS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Parent item collapsible */}
            <Collapsible open={ticketsOpen} onOpenChange={setTicketsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/tickets/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      <span>Tickets</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        ticketsOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              {/* Sous-menu */}
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Nouveau ticket */}

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("nouveau-ticket")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/tickets/nouveau-ticket",
                        params: { userId },
                      }}
                    >
                      Nouveau ticket
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-tickets")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/tickets/tous-les-tickets",
                        params: { userId },
                      }}
                    >
                      Tous les tickets
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={interOpen} onOpenChange={setInterOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/interventions/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      <span>Interventions</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        interOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("toutes-les-interventions")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/interventions/toutes-les-interventions",
                        params: { userId },
                      }}
                    >
                      Toutes les interventions
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("creer-intervention")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/interventions/creer-intervention",
                        params: { userId },
                      }}
                    >
                      Créer une intervention
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("rapports-intervention")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/interventions/rapports-interventions",
                        params: { userId },
                      }}
                    >
                      Rapports
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- DEVIS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={devisOpen} onOpenChange={setDevisOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/devis/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4" />
                      <span>Devis</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        devisOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("toutes-les-demandes")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/devis/toutes-les-demandes",
                        params: { userId },
                      }}
                    >
                      Toutes les demandes
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Devis  */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-devis")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/devis/tous-les-devis",
                        params: { userId },
                      }}
                    >
                      Tous les devis
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ----------- CONTRATS ----------- */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={contrOpen} onOpenChange={setContrOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/contrats/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Contrats</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        contrOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                {/* Mes contrats */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-contrats")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/contrats/tous-les-contrats",
                        params: { userId },
                      }}
                    >
                      Tous les contrats
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Dépenses & factures */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("depenses-et-factures")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/contrats/depenses-et-factures",
                        params: { userId },
                      }}
                    >
                      Dépenses & factures
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={clientsOpen} onOpenChange={setClientsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/prospects/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Prospects</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        clientsOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-prospects")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/prospects/tous-les-prospects",
                        params: { userId },
                      }}
                    >
                      Tous les prospects
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible open={clientsOpen} onOpenChange={setClientsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/clients/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Clients</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        clientsOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-clients")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/clients/tous-les-clients",
                        params: { userId },
                      }}
                    >
                      Tous les clients
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("ajouter-un-client")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/clients/ajouter-un-client",
                        params: { userId },
                      }}
                    >
                      Ajouter un client
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-sites")}
                  >
                    <Link
                      href={{
                        pathname: "/admin/[userId]/clients/tous-les-sites",
                        params: { userId },
                      }}
                    >
                      Tous les sites
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible
              open={fournisseursOpen}
              onOpenChange={setFournisseursOpen}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`flex items-center justify-between ${
                      isActive("/fournisseurs/")
                        ? "bg-sidebar-accent font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Handshake className="h-4 w-4" />
                      <span>Fournisseurs</span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        fournisseursOpen ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent className="animate-collapsible-down ml-8 border-l pl-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("tous-les-fournisseurs")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/fournisseurs/tous-les-fournisseurs",
                        params: { userId },
                      }}
                    >
                      Tous les fournisseurs
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("ajouter-un-fournisseur")}
                  >
                    <Link
                      href={{
                        pathname:
                          "/admin/[userId]/fournisseurs/ajouter-un-fournisseur",
                        params: { userId },
                      }}
                    >
                      Ajouter un fournisseur
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
