"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMesSitesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import type {
  PrestataireUserOnSite,
  SiteClientAvecAgents,
} from "@/server/queries/clientServiceExecutions.query";
import { useAppStore } from "@/stores/application/appStore";
import { Building, Building2, MapPin, UserCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AgentsAttributionDialog } from "./AgentsAttributionDialog";

export function MesSitesClientsClient() {
  const entreprise = useAppStore((s) => s.entreprise);
  const posture = useAppStore((s) => s.postureActive);

  const [sites, setSites] = useState<SiteClientAvecAgents[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    site: SiteClientAvecAgents | null;
  }>({ open: false, site: null });

  const loadSites = useCallback(async () => {
    if (!entreprise?.id || posture !== "prestataire") return;

    setLoading(true);
    const result = await getMesSitesClientsAction({
      entrepriseId: entreprise.id,
    });
    setLoading(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      setSites(result.data.sites);
    }
  }, [entreprise?.id, posture]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handleAttributionChange = (
    siteId: string,
    updatedAgents: PrestataireUserOnSite[],
  ) => {
    setSites((prev) =>
      prev.map((s) =>
        s.siteId === siteId ? { ...s, agentsAttribues: updatedAgents } : s,
      ),
    );
    // Mettre à jour le site dans le dialog aussi
    setDialogState((prev) =>
      prev.site?.siteId === siteId
        ? { ...prev, site: { ...prev.site, agentsAttribues: updatedAgents } }
        : prev,
    );
  };

  if (posture !== "prestataire") {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        Cette page est réservée à la posture prestataire.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        Chargement des sites clients…
      </div>
    );
  }

  if (!loading && sites.length === 0) {
    return (
      <div className="py-12 text-center">
        <Building className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">
          Aucun site client trouvé. Vous apparaîtrez ici lorsque vous serez
          assigné à des prestations actives.
        </p>
      </div>
    );
  }

  // Grouper par client
  const byClient = new Map<string, SiteClientAvecAgents[]>();
  for (const site of sites) {
    if (!byClient.has(site.clientEntrepriseId)) {
      byClient.set(site.clientEntrepriseId, []);
    }
    byClient.get(site.clientEntrepriseId)!.push(site);
  }

  return (
    <>
      <div className="space-y-6">
        {Array.from(byClient.entries()).map(([clientId, clientSites]) => (
          <div key={clientId}>
            {/* Client header */}
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="text-muted-foreground h-4 w-4" />
              <span className="font-semibold">
                {clientSites[0]?.clientEntrepriseNom ?? "Client inconnu"}
              </span>
              <Badge variant="outline" className="text-xs">
                {clientSites.length}{" "}
                {clientSites.length > 1 ? "sites" : "site"}
              </Badge>
            </div>

            {/* Sites du client */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clientSites.map((site) => (
                <Card key={site.siteId} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start gap-2 text-sm font-medium">
                      <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      {site.siteNom ?? "Site sans nom"}
                    </CardTitle>
                    {site.serviceNoms.length > 0 && (
                      <CardDescription className="flex flex-wrap gap-1 pt-1">
                        {site.serviceNoms.map((nom) => (
                          <Badge
                            key={nom}
                            variant="secondary"
                            className="text-xs"
                          >
                            {nom}
                          </Badge>
                        ))}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-0">
                    {/* Agents attribués */}
                    <div>
                      {site.agentsAttribues.length === 0 ? (
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Users className="h-3.5 w-3.5" />
                          Aucun agent attribué
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {site.agentsAttribues.map((agent) => (
                            <div
                              key={agent.attributionId}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <UserCheck className="text-green-600 h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {agent.userPrenom} {agent.userNom}
                              </span>
                              <span className="text-muted-foreground">
                                ·{" "}
                                {agent.role === "responsable_site"
                                  ? "Responsable"
                                  : "Intervenant"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() =>
                        setDialogState({ open: true, site })
                      }
                    >
                      <Users className="h-3.5 w-3.5" />
                      Gérer les agents
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {dialogState.site && entreprise?.id && (
        <AgentsAttributionDialog
          open={dialogState.open}
          onOpenChange={(open) =>
            setDialogState((prev) => ({ ...prev, open }))
          }
          site={dialogState.site}
          prestataireEntrepriseId={entreprise.id}
          onAttributionChange={handleAttributionChange}
        />
      )}
    </>
  );
}
