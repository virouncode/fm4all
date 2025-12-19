"use client";

import { getProspectsAction } from "@/actions/prospectActions";
import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProspects } from "@/lib/queries/prospects/getProspects";
import {
  ProspectsQueryBackendType,
  SelectProspectType,
} from "@/zod-schemas/prospect";
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Target,
  User,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prospectsColumns } from "./prospectsColumns";

type ProspectsTableProps = {
  initialQuery: ProspectsQueryBackendType;
  initialData?: Awaited<ReturnType<typeof getProspects>>;
  idLabelMap: Map<string, string>;
  onRowClick?: (prospect: SelectProspectType) => void;
};

const ProspectsTable = ({
  initialQuery,
  initialData,
  idLabelMap,
  onRowClick,
}: ProspectsTableProps) => {
  // --- DATA STATE ---
  const [items, setItems] = useState<SelectProspectType[]>(
    initialData?.items ?? [],
  );
  const [total, setTotal] = useState<number>(initialData?.total ?? 0);
  const [hasMore, setHasMore] = useState<boolean>(
    initialData?.hasMore ?? false,
  );
  const [page, setPage] = useState<number>(initialData?.page ?? 1);

  // --- DIALOG STATE ---
  const [selectedProspect, setSelectedProspect] =
    useState<SelectProspectType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- ÉTATS DE CHARGEMENT / ERREUR ---
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Quand l'URL change (filtres / tri), le serveur renvoie un NOUVEL `initialData`
  // => on reset la liste et la page
  useEffect(() => {
    if (!initialData) return;
    setItems(initialData.items ?? []);
    setTotal(initialData.total ?? 0);
    setHasMore(initialData.hasMore ?? false);
    setPage(initialData.page ?? 1);
    setIsLoading(false);
    setIsError(false);
  }, [initialData]);

  // --- INFINITE SCROLL: CHARGER LA PAGE SUIVANTE ---
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      setIsError(false);

      const nextPage = page + 1;

      const res = await getProspectsAction({
        ...initialQuery,
        page: nextPage,
      });

      if (res.serverError || res.validationErrors || !res.data) {
        console.error("Erreur lors du chargement de plus de prospects:", res);
        setIsError(true);
        return;
      }

      const data = res.data;

      setItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (error) {
      console.error("Erreur lors du chargement de plus de prospects:", error);
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, initialQuery]);

  const memoIdLabelMap = useMemo(() => idLabelMap, [idLabelMap]);

  const handleRowClick = (prospect: SelectProspectType) => {
    if (onRowClick) {
      onRowClick(prospect);
      return;
    }
    setSelectedProspect(prospect);
    setIsDialogOpen(true);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "-";
    return phone;
  };

  const typeBatimentLabel: Record<string, string> = {
    bureaux: "Bureaux",
    commerce: "Commerce",
    mixte: "Mixte",
    entrepot: "Entrepôt",
  };

  const typeOccupationLabel: Record<string, string> = {
    proprietaire: "Propriétaire",
    locataire: "Locataire",
  };

  return (
    <>
      <InfiniteDataTable<SelectProspectType>
        columns={prospectsColumns}
        items={items}
        isLoading={isLoading}
        isError={isError}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        idLabelMap={memoIdLabelMap}
        total={total}
        onRowClick={handleRowClick}
      />

      {/* Dialog avec les informations du prospect */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedProspect?.nomEntreprise}
            </DialogTitle>
          </DialogHeader>

          {selectedProspect && (
            <div className="space-y-4">
              {/* Informations générales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">SIRET</span>
                      <p className="font-medium">
                        {selectedProspect.siret || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Surface</span>
                      <p className="font-medium">
                        {selectedProspect.surface
                          ? `${selectedProspect.surface} m²`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effectif</span>
                      <p className="font-medium">
                        {selectedProspect.effectif
                          ? `${selectedProspect.effectif} personnes`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Type de bâtiment
                      </span>
                      <p className="font-medium">
                        {selectedProspect.typeBatiment
                          ? typeBatimentLabel[selectedProspect.typeBatiment] ||
                            selectedProspect.typeBatiment
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Occupation</span>
                      <p className="font-medium">
                        {selectedProspect.typeOccupation
                          ? typeOccupationLabel[
                              selectedProspect.typeOccupation
                            ] || selectedProspect.typeOccupation
                          : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact principal */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Contact principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Nom complet</span>
                      <p className="font-medium">
                        {selectedProspect.prenomContact}{" "}
                        {selectedProspect.nomContact}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Poste</span>
                      <p className="font-medium">
                        {selectedProspect.posteContact || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <a
                      href={`mailto:${selectedProspect.emailContact}`}
                      className="text-primary hover:underline"
                    >
                      {selectedProspect.emailContact}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <a
                      href={`tel:${selectedProspect.phoneContact}`}
                      className="text-primary hover:underline"
                    >
                      {formatPhone(selectedProspect.phoneContact)}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Signataire (si renseigné) */}
              {(selectedProspect.prenomSignataire ||
                selectedProspect.nomSignataire) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4" />
                      Signataire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">
                          Nom complet
                        </span>
                        <p className="font-medium">
                          {selectedProspect.prenomSignataire}{" "}
                          {selectedProspect.nomSignataire}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Poste</span>
                        <p className="font-medium">
                          {selectedProspect.posteSignataire || "-"}
                        </p>
                      </div>
                    </div>
                    {selectedProspect.emailSignataire && (
                      <div className="flex items-center gap-2">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <a
                          href={`mailto:${selectedProspect.emailSignataire}`}
                          className="text-primary hover:underline"
                        >
                          {selectedProspect.emailSignataire}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Adresse */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-1">
                    {selectedProspect.adresseLigne1 && (
                      <p>{selectedProspect.adresseLigne1}</p>
                    )}
                    {selectedProspect.adresseLigne2 && (
                      <p>{selectedProspect.adresseLigne2}</p>
                    )}
                    <p className="font-medium">
                      {selectedProspect.codePostal} {selectedProspect.ville}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Dates et commentaires */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">
                        Date de démarrage souhaitée
                      </span>
                      <p className="font-medium">
                        {formatDate(selectedProspect.dateDeDemarrage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Créé le</span>
                      <p className="font-medium">
                        {formatDate(selectedProspect.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commentaires */}
              {selectedProspect.commentaires && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4" />
                      Commentaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedProspect.commentaires}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProspectsTable;
