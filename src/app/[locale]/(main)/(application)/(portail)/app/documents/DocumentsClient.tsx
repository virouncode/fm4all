"use client";

import InfiniteDataTable from "@/components/tables/InfiniteDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import {
  getDocumentPartnersAction,
  getDocumentTagsAction,
  getDocumentTagsForPartnersAction,
  getDocumentsAction,
} from "@/server/actions/documentsActions";
import { useAppStore } from "@/stores/application/appStore";
import { useUiStore } from "@/stores/ui/uiStore";
import {
  EntrepriseMinimalType,
  SelectDocumentWithTagsType,
} from "@/zod-schemas/documents.schema";
import { ArrowDownUp, Filter, Grid3x3, List, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createDocumentsColumns,
  documentsIdLabelMap,
} from "./createDocumentsColumns";
import { DocumentDeleteDialog } from "./DocumentDeleteDialog";
import { DocumentEditDialog } from "./DocumentEditDialog";
import { DocumentFormDialog } from "./DocumentFormDialog";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";
import { DocumentsFiltersDialog } from "./DocumentsFiltersDialog";
import { DocumentsGrid } from "./DocumentsGrid";
import { DocumentsSortDialog } from "./DocumentsSortDialog";

type TagType = { id: string; nom: string; couleur: string | null };

type SearchParamsType = {
  tab?: string;
  search?: string;
  visibilite?: string;
  tagIds?: string;
  partenaireEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

type DocumentsClientProps = {
  searchParams: SearchParamsType;
};

type OrderByType =
  | "createdAt"
  | "titre"
  | "filename"
  | "sizeBytes"
  | "mimeType";

function toOrderBy(value: string | undefined): OrderByType {
  const valid: OrderByType[] = [
    "createdAt",
    "titre",
    "filename",
    "sizeBytes",
    "mimeType",
  ];
  return value && valid.includes(value as OrderByType)
    ? (value as OrderByType)
    : "createdAt";
}

function toOrderDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function toTab(value: string | undefined): "mes_documents" | "partages" {
  return value === "partages" ? "partages" : "mes_documents";
}

export function DocumentsClient({ searchParams }: DocumentsClientProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const roleClientAdhesion = useAppStore((state) => state.roleClientAdhesion);
  const rolePrestataireAdhesion = useAppStore(
    (state) => state.rolePrestataireAdhesion,
  );
  const rolePlateformeAdhesion = useAppStore(
    (state) => state.rolePlateformeAdhesion,
  );
  const router = useRouter();

  const DocumentViewType = useUiStore((state) => state.DocumentViewType);
  const setDocumentViewType = useUiStore((state) => state.setDocumentViewType);

  // Permission: can the current user create/edit/delete documents?
  const canWrite =
    rolePlateformeAdhesion != null ||
    (posture === "client" &&
      (roleClientAdhesion === "admin" || roleClientAdhesion === "manager")) ||
    (posture === "prestataire" &&
      (rolePrestataireAdhesion === "admin" ||
        rolePrestataireAdhesion === "manager"));

  const currentTab = toTab(searchParams.tab);
  const isPartagesTab = currentTab === "partages";

  // Data
  const [documents, setDocuments] = useState<SelectDocumentWithTagsType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [partners, setPartners] = useState<EntrepriseMinimalType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Loading
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDocument, setEditDocument] =
    useState<SelectDocumentWithTagsType | null>(null);
  const [deleteDocument, setDeleteDocument] =
    useState<SelectDocumentWithTagsType | null>(null);
  const [previewDocument, setPreviewDocument] =
    useState<SelectDocumentWithTagsType | null>(null);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  // Active tag IDs from URL (comma-separated)
  const activeTagIds = searchParams.tagIds
    ? searchParams.tagIds.split(",").filter(Boolean)
    : [];

  const pageSize = 30;

  // Count active filters (excluding tab/orderBy/orderDir/tagIds/partenaireEntrepriseId)
  const activeFiltersCount = [
    searchParams.search,
    searchParams.visibilite,
  ].filter(Boolean).length;

  // Load tags for the active tab
  const loadTags = useCallback(async () => {
    if (!entreprise?.id) return;
    const result = isPartagesTab
      ? await getDocumentTagsForPartnersAction({
          entrepriseId: entreprise.id,
          partenaireEntrepriseId:
            searchParams.partenaireEntrepriseId || undefined,
        })
      : await getDocumentTagsAction({ entrepriseId: entreprise.id });
    if (result?.data?.tags) setTags(result.data.tags);
  }, [entreprise?.id, isPartagesTab, searchParams.partenaireEntrepriseId]);

  // Load partner list (for "Documents partagés" selector)
  const loadPartners = useCallback(async () => {
    if (!entreprise?.id || !isPartagesTab) return;
    const result = await getDocumentPartnersAction({
      entrepriseId: entreprise.id,
    });
    if (result?.data?.partners) setPartners(result.data.partners);
  }, [entreprise?.id, isPartagesTab]);

  // Load documents (initial + after filter/tab change)
  const loadDocuments = useCallback(async () => {
    if (!entreprise?.id) return;
    setLoading(true);
    setIsError(false);
    try {
      const tagIds = searchParams.tagIds
        ? searchParams.tagIds.split(",").filter(Boolean)
        : [];
      const result = await getDocumentsAction({
        entrepriseId: entreprise.id,
        tab: currentTab,
        search: searchParams.search || undefined,
        visibilite:
          searchParams.visibilite === "prive" ||
          searchParams.visibilite === "public"
            ? searchParams.visibilite
            : undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        partenaireEntrepriseId:
          searchParams.partenaireEntrepriseId || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: 1,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data) {
        setDocuments(result.data.documents ?? []);
        setTotal(result.data.total ?? 0);
        setHasMore(result.data.hasMore ?? false);
        setPage(1);
      }
    } catch {
      toast.error("Erreur lors du chargement des documents");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [
    entreprise?.id,
    currentTab,
    searchParams.search,
    searchParams.visibilite,
    searchParams.tagIds,
    searchParams.partenaireEntrepriseId,
    searchParams.orderBy,
    searchParams.orderDir,
  ]);

  // Initial data load
  useEffect(() => {
    if (!entreprise?.id) return;
    loadDocuments();
    loadTags();
    if (isPartagesTab) loadPartners();
  }, [
    entreprise?.id,
    posture,
    searchParams,
    isPartagesTab,
    loadDocuments,
    loadTags,
    loadPartners,
  ]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isError || !entreprise?.id) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const tagIds = searchParams.tagIds
        ? searchParams.tagIds.split(",").filter(Boolean)
        : [];
      const result = await getDocumentsAction({
        entrepriseId: entreprise.id,
        tab: currentTab,
        search: searchParams.search || undefined,
        visibilite:
          searchParams.visibilite === "prive" ||
          searchParams.visibilite === "public"
            ? searchParams.visibilite
            : undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        partenaireEntrepriseId:
          searchParams.partenaireEntrepriseId || undefined,
        orderBy: toOrderBy(searchParams.orderBy),
        orderDir: toOrderDir(searchParams.orderDir),
        page: nextPage,
        pageSize,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        setIsError(true);
      } else if (result?.data?.documents) {
        setDocuments((prev) => [...prev, ...result.data!.documents]);
        setHasMore(result.data.hasMore ?? false);
        setPage(nextPage);
      }
    } catch {
      toast.error("Erreur lors du chargement");
      setIsError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    isError,
    entreprise?.id,
    page,
    currentTab,
    searchParams.search,
    searchParams.visibilite,
    searchParams.tagIds,
    searchParams.partenaireEntrepriseId,
    searchParams.orderBy,
    searchParams.orderDir,
  ]);

  // Tab change
  const handleTabChange = (tab: string) => {
    const query: Record<string, string> = { tab };
    router.replace({ pathname: "/app/documents", query }, { scroll: false });
  };

  // Tag toggle (OR logic, comma-separated in URL)
  const handleTagToggle = (tagId: string) => {
    const current = activeTagIds;
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];

    const query: Record<string, string> = {
      ...(searchParams as Record<string, string>),
    };
    if (next.length > 0) {
      query.tagIds = next.join(",");
    } else {
      delete query.tagIds;
    }
    router.replace({ pathname: "/app/documents", query }, { scroll: false });
  };

  // Partner selector change (for "Documents partagés")
  const handlePartnerChange = (partenaireEntrepriseId: string) => {
    const query: Record<string, string> = {
      ...(searchParams as Record<string, string>),
    };
    if (partenaireEntrepriseId && partenaireEntrepriseId !== "all") {
      query.partenaireEntrepriseId = partenaireEntrepriseId;
    } else {
      delete query.partenaireEntrepriseId;
    }
    router.replace({ pathname: "/app/documents", query }, { scroll: false });
  };

  const handleDocumentCreated = () => {
    setCreateDialogOpen(false);
    loadDocuments();
    loadTags();
  };

  const handleDocumentUpdated = () => {
    setEditDocument(null);
    loadDocuments();
  };

  const handleDocumentDeleted = () => {
    setDeleteDocument(null);
    loadDocuments();
  };

  const columns = createDocumentsColumns({
    canWrite,
    isPartagesTab,
    onPreview: setPreviewDocument,
    onEdit: setEditDocument,
    onDelete: setDeleteDocument,
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="flex-shrink-0"
      >
        <TabsList>
          <TabsTrigger value="mes_documents">Mes documents</TabsTrigger>
          <TabsTrigger value="partages">Documents partagés</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Partner selector — "Documents partagés" tab only */}
      {isPartagesTab && partners.length > 0 && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Entreprise
          </span>
          <Select
            value={searchParams.partenaireEntrepriseId ?? "all"}
            onValueChange={handlePartnerChange}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Toutes les entreprises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entreprises</SelectItem>
              {partners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        {/* View toggle */}
        <div
          role="group"
          aria-label="Mode d'affichage"
          className="flex items-center"
        >
          <Button
            variant={DocumentViewType === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setDocumentViewType("list")}
            className="rounded-r-none border-r-0"
            aria-label="Vue liste"
            aria-pressed={DocumentViewType === "list"}
          >
            <List aria-hidden="true" />
          </Button>
          <Button
            variant={DocumentViewType === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setDocumentViewType("grid")}
            className="rounded-l-none"
            aria-label="Vue grille"
            aria-pressed={DocumentViewType === "grid"}
          >
            <Grid3x3 aria-hidden="true" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersDialogOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filtrer
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-1.5 text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDialogOpen(true)}
          >
            <ArrowDownUp className="h-4 w-4" />
            Trier
          </Button>
          {canWrite && !isPartagesTab && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau document
            </Button>
          )}
        </div>
      </div>

      {/* Tag bar */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          Tags :{" "}
        </span>
        {tags.length === 0 ? (
          <span className="text-muted-foreground text-sm italic">
            Aucun tag disponible
          </span>
        ) : (
          tags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer select-none"
                style={
                  tag.couleur
                    ? isActive
                      ? {
                          backgroundColor: tag.couleur,
                          borderColor: tag.couleur,
                          color: "#fff",
                        }
                      : { borderColor: tag.couleur, color: tag.couleur }
                    : undefined
                }
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.nom}
              </Badge>
            );
          })
        )}
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden">
        {DocumentViewType === "list" ? (
          <InfiniteDataTable<SelectDocumentWithTagsType>
            columns={columns}
            items={documents}
            total={total}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            idLabelMap={documentsIdLabelMap}
            onRowClick={setPreviewDocument}
          />
        ) : (
          <DocumentsGrid
            documents={documents}
            canWrite={canWrite}
            isPartagesTab={isPartagesTab}
            isLoading={loading}
            isLoadingMore={isLoadingMore}
            isError={isError}
            hasMore={hasMore}
            loadMore={loadMore}
            onPreview={setPreviewDocument}
            onEdit={setEditDocument}
            onDelete={setDeleteDocument}
          />
        )}
      </div>

      {/* Dialogs */}
      {entreprise?.id && (
        <>
          <DocumentFormDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            entrepriseId={entreprise.id}
            onSuccess={handleDocumentCreated}
          />

          <DocumentEditDialog
            document={editDocument}
            onOpenChange={(open) => {
              if (!open) setEditDocument(null);
            }}
            entrepriseId={entreprise.id}
            onSuccess={handleDocumentUpdated}
          />

          <DocumentDeleteDialog
            document={deleteDocument}
            onOpenChange={(open) => {
              if (!open) setDeleteDocument(null);
            }}
            entrepriseId={entreprise.id}
            onSuccess={handleDocumentDeleted}
          />
        </>
      )}

      <DocumentPreviewDialog
        document={previewDocument}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(null);
        }}
      />

      <DocumentsFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        searchParams={searchParams}
        isPartagesTab={isPartagesTab}
        partners={partners}
      />

      <DocumentsSortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        searchParams={searchParams as Record<string, string | undefined>}
      />
    </div>
  );
}
