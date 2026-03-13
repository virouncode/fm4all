"use client";

import { RhfComboboxInput } from "@/components/rhf/RhfComboboxInput";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import {
  devisLigneUniteCT,
  devisPeriodeFacturationCT,
  devisTypePrixCT,
} from "@/constants/codeTables";
import { useRouter } from "@/i18n/navigation";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import { getEntreprisesClientesAction, getMonEntrepriseDetailsAction } from "@/server/actions/entreprisesActions";
import { getSiteResponsableAction, saveDevisWithLignesAction } from "@/server/actions/devisActions";
import { getSitesAction } from "@/server/actions/sitesActions";
import type { ClientAvecDetails } from "@/server/queries/clientServiceExecutions.query";
import {
  devisNouveauSchema,
  type DevisNouveauFormType,
} from "@/zod-schemas/devis.schema";
import {
  type DevisPeriodeFacturationType,
  type DevisTypePrixType,
} from "@/zod-schemas/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type Path,
} from "react-hook-form";
import { toast } from "sonner";
import type { DevisPreviewData, DevisPreviewLigne } from "../DevisPreviewCard";
import { DevisPreviewCard } from "../DevisPreviewCard";

// ============================= TYPES ==============================//

type SiteResponsableType = {
  prenom: string;
  nom: string;
  email: string;
  phone: string | null;
};

type SiteOptionType = {
  id: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
};

export type EmetteurInfoType = {
  id: string;
  nom: string;
  siret: string;
  numeroTva: string | null;
  logoStorageKey?: string | null;
};

type ServiceOptionType = {
  id: string;
  nom: string;
};

type DevisNouveauClientProps = {
  emetteur: EmetteurInfoType;
  services: ServiceOptionType[];
  posture: "prestataire" | "plateforme";
};

// ============================= CONSTANTES ==============================//

const TVA_OPTIONS = [
  { value: "2000", label: "20 %" },
  { value: "1000", label: "10 %" },
  { value: "550", label: "5,5 %" },
  { value: "0", label: "0 %" },
] as const;

const DEFAULT_LIGNE: DevisNouveauFormType["lignes"][0] = {
  serviceId: "",
  designation: "",
  description: "",
  quantite: "1",
  unite: "",
  prixUnitaireHtEur: "",
  tauxTva: "2000",
  hasRemise: false,
  remiseHtMontantEur: "",
  typePrix: "one_shot",
  periodeFacturation: "",
};

// ============================= HELPERS ==============================//

function eurToCentimes(eur: string): number {
  const v = parseFloat(eur.replace(",", ".") || "0");
  return isNaN(v) ? 0 : Math.round(v * 100);
}

function calcTtcStr(prixHtEur: string, tauxTva: string): string {
  const ht = parseFloat(prixHtEur.replace(",", ".") || "0");
  if (isNaN(ht)) return "0,00";
  const ttc = ht * (1 + Number(tauxTva) / 10000);
  return ttc.toFixed(2);
}

// Type permissif pour useWatch (tous les champs sont optionnels y compris dans les objets imbriqués)
type PreviewValuesType = {
  titre?: string;
  description?: string;
  validTo?: string;
  remiseGlobaleHtEur?: string;
  lignes?: Array<{
    designation?: string;
    description?: string;
    quantite?: string;
    unite?: string;
    prixUnitaireHtEur?: string;
    tauxTva?: string;
    hasRemise?: boolean;
    remiseHtMontantEur?: string;
    typePrix?: string;
    periodeFacturation?: string;
  }>;
};

function buildPreview(
  emetteur: EmetteurInfoType,
  selectedClient: ClientAvecDetails | null,
  selectedSite: SiteOptionType | null,
  values: PreviewValuesType,
  emetteurLogoUrl: string | null,
  siteResponsable: SiteResponsableType | null,
): DevisPreviewData {
  const lignes = values.lignes ?? [];
  const previewLignes: DevisPreviewLigne[] = lignes.map((l) => ({
    designation: l.designation || "—",
    description: l.description || null,
    quantite: l.quantite || "0",
    unite: String(l.unite ?? ""),
    prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur ?? ""),
    tauxTva: Number(l.tauxTva ?? "2000"),
    remiseHtMontant: l.hasRemise
      ? eurToCentimes(l.remiseHtMontantEur ?? "")
      : 0,
    typePrix: l.typePrix || "one_shot",
    periodeFacturation: l.periodeFacturation || null,
  }));

  return {
    numero: null,
    titre: values.titre || "Nouveau devis",
    description: values.description || null,
    statut: "brouillon",
    remiseGlobaleHt: eurToCentimes(values.remiseGlobaleHtEur ?? ""),
    dateEmission: null,
    validTo: values.validTo ? new Date(values.validTo) : null,
    updatedAt: null,
    emetteurEntrepriseNom: emetteur.nom,
    emetteurEntrepriseSiret: emetteur.siret,
    emetteurEntrepriseNumeroTva: emetteur.numeroTva,
    emetteurEmailContact: null,
    emetteurPhoneContact: null,
    emetteurPrenomContact: null,
    emetteurNomContact: null,
    emetteurLogoUrl,
    proprietaireEntrepriseNom: selectedClient?.nom ?? "",
    proprietaireEntrepriseSiret: selectedClient?.siret ?? "",
    proprietaireEntrepriseNumeroTva: selectedClient?.numeroTva ?? null,
    siteNom: selectedSite?.nom ?? "",
    siteAdresse: selectedSite?.adresse ?? "",
    siteCodePostal: selectedSite?.codePostal ?? null,
    siteVille: selectedSite?.ville ?? null,
    siteContactPrenom: siteResponsable?.prenom ?? null,
    siteContactNom: siteResponsable?.nom ?? null,
    siteContactEmail: siteResponsable?.email ?? null,
    siteContactPhone: siteResponsable?.phone ?? null,
    lignes: previewLignes,
  };
}

// ============================= COMPOSANT ==============================//

export function DevisNouveauClient({ emetteur, services, posture }: DevisNouveauClientProps) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [clients, setClients] = useState<ClientAvecDetails[]>([]);
  const [sites, setSites] = useState<SiteOptionType[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [selectedClient, setSelectedClient] =
    useState<ClientAvecDetails | null>(null);
  const [selectedSite, setSelectedSite] = useState<SiteOptionType | null>(null);
  const [siteResponsable, setSiteResponsable] = useState<SiteResponsableType | null>(null);
  const [openLines, setOpenLines] = useState<Set<number>>(new Set([0]));
  const [emetteurLogoUrl, setEmetteurLogoUrl] = useState<string | null>(null);

  // Charger l'URL du logo de l'émetteur
  useEffect(() => {
    if (!emetteur.logoStorageKey) return;
    getPresignedReadUrl({
      key: emetteur.logoStorageKey,
      proprietaireEntrepriseId: emetteur.id,
    })
      .then(setEmetteurLogoUrl)
      .catch(() => null);
  }, [emetteur.logoStorageKey, emetteur.id]);

  const form = useForm<DevisNouveauFormType>({
    resolver: zodResolver(devisNouveauSchema),
    mode: "onTouched",
    defaultValues: {
      proprietaireEntrepriseId: "",
      siteId: "",
      titre: "",
      validTo: "",
      lignes: [{ ...DEFAULT_LIGNE }],
      remiseGlobaleHtEur: "",
      description: "",
      noteInterne: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lignes",
  });

  // useWatch pour la preview live (évite form.watch() dans le render)
  const watchedValues = useWatch({ control: form.control });

  // ─── Chargement des clients ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingClients(true);
      try {
        if (posture === "plateforme") {
          const result = await getEntreprisesClientesAction();
          if (result?.data?.clients) {
            // Pour la plateforme, clients est { id, nom }[] — on construit un ClientAvecDetails minimal
            setClients(
              result.data.clients.map((c) => ({
                id: c.id,
                nom: c.nom,
                siret: "",
                numeroTva: null,
                adresseLigne1: null,
                adresseLigne2: null,
                codePostal: null,
                ville: null,
                formeJuridique: null,
                sireneSyncedAt: null,
                createdAt: new Date(),
                logoStorageKey: null,
                roles: [],
                hasActiveAdmin: false,
                adminEmail: null,
                nbSites: 0,
                services: [],
                relationId: null,
                relationPrenomContactClient: null,
                relationNomContactClient: null,
                relationEmailContactClient: null,
                relationPhoneContactClient: null,
              })),
            );
          }
        } else {
          const result = await getMesClientsAction({ entrepriseId: emetteur.id });
          if (result?.data?.clients) {
            setClients(result.data.clients);
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setLoadingClients(false);
      }
    }
    void load();
  }, [emetteur.id, posture]);

  // ─── Chargement du responsable_site ─────────────────────────────
  async function loadResponsableForSite(siteId: string, entrepriseId: string) {
    const result = await getSiteResponsableAction({ siteId, entrepriseId });
    setSiteResponsable(result?.data?.responsable ?? null);
  }

  // ─── Enrichissement client (plateforme) ─────────────────────────
  async function enrichClientForPlateforme(clientId: string) {
    const result = await getMonEntrepriseDetailsAction({ entrepriseId: clientId });
    if (result?.data?.entreprise) {
      const e = result.data.entreprise;
      const enriched = {
        siret: e.siret ?? "",
        numeroTva: e.numeroTva ?? null,
      };
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, ...enriched } : c)),
      );
      setSelectedClient((prev) =>
        prev?.id === clientId ? { ...prev, ...enriched } : prev,
      );
    }
  }

  // ─── Chargement des sites pour un client ────────────────────────
  async function loadSitesForClient(clientId: string) {
    if (!clientId) {
      setSites([]);
      setSelectedSite(null);
      setSiteResponsable(null);
      form.setValue("siteId", "");
      return;
    }
    setLoadingSites(true);
    try {
      const result = await getSitesAction({ entrepriseId: clientId });
      if (result?.data) {
        setSites(
          result.data.map((s) => ({
            id: s.id,
            nom: s.nom,
            adresse: s.adresseLigne1 ?? "",
            codePostal: s.codePostal ?? "",
            ville: s.ville ?? "",
          })),
        );
      }
    } catch {
      toast.error("Erreur lors du chargement des sites");
    } finally {
      setLoadingSites(false);
    }
  }

  // ─── Step 1 → 2 ──────────────────────────────────────────────────
  async function handleContinuer() {
    const valid = await form.trigger([
      "proprietaireEntrepriseId",
      "siteId",
      "titre",
    ]);
    if (!valid) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Lignes ──────────────────────────────────────────────────────
  function toggleLine(index: number) {
    setOpenLines((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleAddLigne() {
    append({ ...DEFAULT_LIGNE });
    setOpenLines((prev) => new Set(prev).add(fields.length));
  }

  function handleRemoveLigne(index: number) {
    remove(index);
    setOpenLines((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  // ─── Soumission ──────────────────────────────────────────────────
  async function onSubmit(data: DevisNouveauFormType) {
    if (!selectedClient || !selectedSite) return;

    try {
      const modeCommercialSnapshot =
        posture === "plateforme" ? "intermediaire" : "direct";

      const result = await saveDevisWithLignesAction({
        proprietaireEntrepriseId: selectedClient.id,
        emetteurEntrepriseId: emetteur.id,
        demandeurEntrepriseId: selectedClient.id,
        siteId: selectedSite.id,
        modeCommercialSnapshot,
        titre: data.titre.trim(),
        description: data.description.trim() || undefined,
        noteInterne: data.noteInterne.trim() || undefined,
        remiseGlobaleHt: eurToCentimes(data.remiseGlobaleHtEur),
        validTo: data.validTo ? new Date(data.validTo) : undefined,
        lignes: data.lignes.map((l, i) => ({
          serviceId: l.serviceId || undefined,
          designation: l.designation.trim() || "—",
          description: l.description.trim() || undefined,
          quantite: l.quantite || "1",
          unite: l.unite,
          prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur),
          tauxTva: Number(l.tauxTva),
          remiseHtMontant: l.hasRemise
            ? eurToCentimes(l.remiseHtMontantEur)
            : 0,
          typePrix: l.typePrix as DevisTypePrixType,
          periodeFacturation:
            l.typePrix === "abonnement" && l.periodeFacturation
              ? (l.periodeFacturation as DevisPeriodeFacturationType)
              : undefined,
          ordre: i,
        })),
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.devis) {
        toast.success("Devis enregistré");
        router.push("/app/devis");
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }

  // ─── Preview live ─────────────────────────────────────────────────
  const preview = buildPreview(
    emetteur,
    selectedClient,
    selectedSite,
    watchedValues,
    emetteurLogoUrl,
    siteResponsable,
  );

  const { isSubmitting } = form.formState;

  // ============================= RENDER ==============================//

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Panneau gauche ── */}
      <div className="flex w-[40%] flex-col overflow-hidden border-r">
        {/* Header fixe */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() =>
              step === 2 ? setStep(1) : router.push("/app/devis")
            }
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 2 ? "Retour" : "Annuler"}
          </Button>
          <span className="text-muted-foreground text-sm">
            Nouveau devis — étape {step}/2
          </span>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 ? (
                <Step1
                  clients={clients}
                  loadingClients={loadingClients}
                  sites={sites}
                  loadingSites={loadingSites}
                  posture={posture}
                  onClientChange={(clientId) => {
                    const client =
                      clients.find((c) => c.id === clientId) ?? null;
                    setSelectedClient(client);
                    setSelectedSite(null);
                    form.setValue("siteId", "");
                    void loadSitesForClient(clientId);
                    if (posture === "plateforme") {
                      void enrichClientForPlateforme(clientId);
                    }
                  }}
                  onSiteChange={(siteId) => {
                    const site = sites.find((s) => s.id === siteId) ?? null;
                    setSelectedSite(site);
                    if (site && selectedClient) {
                      void loadResponsableForSite(site.id, selectedClient.id);
                    } else {
                      setSiteResponsable(null);
                    }
                  }}
                  onSetValidToRelative={(days) => {
                    const target = format(
                      addDays(new Date(), days),
                      "yyyy-MM-dd",
                    );
                    form.setValue("validTo", target);
                  }}
                  onContinuer={handleContinuer}
                />
              ) : (
                <Step2
                  fields={fields}
                  openLines={openLines}
                  onToggleLine={toggleLine}
                  onAddLigne={handleAddLigne}
                  onRemoveLigne={handleRemoveLigne}
                  isSubmitting={isSubmitting}
                  services={services}
                />
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* ── Preview A4 ── */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-16 dark:bg-gray-950">
        {/* Wrapper aux dimensions scalées — évite que transform réserve l'espace A4 complet */}
        <div
          className="shrink-0"
          style={{
            width: "calc(210mm * 0.75)",
            height: "calc(297mm * 0.75)",
            overflow: "hidden",
          }}
        >
          <div
            style={{ transform: "scale(0.75)", transformOrigin: "top left" }}
          >
            <DevisPreviewCard devis={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================= ÉTAPE 1 ==============================//

type Step1Props = {
  clients: ClientAvecDetails[];
  loadingClients: boolean;
  sites: SiteOptionType[];
  loadingSites: boolean;
  posture: "prestataire" | "plateforme";
  onClientChange: (id: string) => void;
  onSiteChange: (id: string) => void;
  onSetValidToRelative: (days: number) => void;
  onContinuer: () => void;
};

function Step1({
  clients,
  loadingClients,
  sites,
  loadingSites,
  posture,
  onClientChange,
  onSiteChange,
  onSetValidToRelative,
  onContinuer,
}: Step1Props) {
  const proprietaireId = useWatch<DevisNouveauFormType, "proprietaireEntrepriseId">({
    name: "proprietaireEntrepriseId",
  });
  const validTo = useWatch<DevisNouveauFormType, "validTo">({ name: "validTo" });

  return (
    <div className="space-y-8">
      {/* Coordonnées du client */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Coordonnées du client
        </h2>

        <div className="space-y-4">
          <RhfControlledSelect<DevisNouveauFormType>
            name="proprietaireEntrepriseId"
            label="Client"
            requiredMark
            placeholder={
              loadingClients ? "Chargement…" : "Sélectionnez un client"
            }
            disabled={loadingClients}
            onChange={(v) => onClientChange(String(v))}
            selectClassName="w-full"
          >
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nom}
              </SelectItem>
            ))}
          </RhfControlledSelect>

          <RhfControlledSelect<DevisNouveauFormType>
            name="siteId"
            label="Site"
            requiredMark
            placeholder={
              !proprietaireId
                ? "Choisissez d'abord un client"
                : loadingSites
                  ? "Chargement…"
                  : sites.length === 0
                    ? "Aucun site disponible"
                    : "Sélectionnez un site"
            }
            disabled={!proprietaireId || loadingSites || sites.length === 0}
            onChange={(v) => onSiteChange(String(v))}
            selectClassName="w-full"
          >
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nom}
              </SelectItem>
            ))}
          </RhfControlledSelect>
        </div>
      </section>

      {/* Détails du devis */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Détails du devis
        </h2>

        <div className="space-y-4 rounded-lg border p-4">
          {/* Numéro automatique */}
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Numéro de devis</span>
            <span className="font-mono text-xs italic">
              Attribué à l&apos;émission
            </span>
          </div>

          {/* Mode commercial (lecture seule, forcé par la posture) */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mode commercial</span>
            <span className="bg-muted rounded px-2 py-0.5 text-xs font-medium">
              {posture === "plateforme" ? "Intermédiation" : "Prestation directe"}
            </span>
          </div>

          {/* Titre */}
          <RhfInput<DevisNouveauFormType>
            name="titre"
            label="Titre du devis"
            requiredMark
            placeholder="ex : Nettoyage locaux Q1 2026"
          />

          {/* Date d'expiration */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Date d&apos;expiration</Label>
            <div className="mb-1 flex flex-wrap gap-2">
              {([15, 30, 90] as const).map((days) => {
                const target = format(addDays(new Date(), days), "yyyy-MM-dd");
                return (
                  <Button
                    key={days}
                    type="button"
                    size="sm"
                    variant={validTo === target ? "default" : "outline"}
                    onClick={() => onSetValidToRelative(days)}
                  >
                    Dans {days} jours
                  </Button>
                );
              })}
            </div>
            <RhfDatePicker<DevisNouveauFormType> name="validTo" />
          </div>
        </div>
      </section>

      <Button className="w-full" size="lg" type="button" onClick={onContinuer}>
        Continuer
      </Button>
    </div>
  );
}

// ============================= ÉTAPE 2 ==============================//

type Step2Props = {
  fields: ReturnType<typeof useFieldArray<DevisNouveauFormType, "lignes">>["fields"];
  openLines: Set<number>;
  onToggleLine: (index: number) => void;
  onAddLigne: () => void;
  onRemoveLigne: (index: number) => void;
  isSubmitting: boolean;
  services: ServiceOptionType[];
};

function Step2({
  fields,
  openLines,
  onToggleLine,
  onAddLigne,
  onRemoveLigne,
  isSubmitting,
  services,
}: Step2Props) {
  return (
    <div className="space-y-8 pb-6">
      {/* Produits et services */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Produits et services
        </h2>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <LigneAccordion
              key={field.id}
              index={index}
              isOpen={openLines.has(index)}
              canRemove={fields.length > 1}
              onToggle={() => onToggleLine(index)}
              onRemove={() => onRemoveLigne(index)}
              services={services}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary mt-3"
          onClick={onAddLigne}
        >
          <Plus className="mr-1 h-4 w-4" />
          Ajouter un élément
        </Button>
      </section>

      {/* Remise globale */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Remise sur le total
        </h2>
        <div className="flex items-center gap-2">
          <RhfInput<DevisNouveauFormType>
            name="remiseGlobaleHtEur"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            className="max-w-48"
          />
          <span className="text-muted-foreground text-sm">EUR HT</span>
        </div>
      </section>

      {/* Description (visible PDF) */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Description{" "}
          <span className="font-normal normal-case">
            (visible par le client)
          </span>
        </h2>
        <RhfTextArea<DevisNouveauFormType>
          name="description"
          placeholder="Ajoutez des précisions sur le devis, conditions particulières…"
          rows={3}
        />
      </section>

      {/* Note interne */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Note interne{" "}
          <span className="font-normal normal-case">(non imprimée)</span>
        </h2>
        <RhfTextArea<DevisNouveauFormType>
          name="noteInterne"
          placeholder="Note visible uniquement par votre équipe…"
          rows={2}
        />
      </section>

      {/* CTA */}
      <Button
        className="w-full"
        size="lg"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enregistrement…" : "Enregistrer le brouillon"}
      </Button>
    </div>
  );
}

// ============================= LIGNE ACCORDION ==============================//

type LigneAccordionProps = {
  index: number;
  isOpen: boolean;
  canRemove: boolean;
  onToggle: () => void;
  onRemove: () => void;
  services: ServiceOptionType[];
};

function LigneAccordion({
  index,
  isOpen,
  canRemove,
  onToggle,
  onRemove,
  services,
}: LigneAccordionProps) {
  const { control, setValue } = useFormContext<DevisNouveauFormType>();

  // useWatch pour affichage accordion header + calcul TTC
  const designation = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.designation` as Path<DevisNouveauFormType>,
  });
  const prixHtEur = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.prixUnitaireHtEur` as Path<DevisNouveauFormType>,
  });
  const tauxTva = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.tauxTva` as Path<DevisNouveauFormType>,
  });
  const hasRemise = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.hasRemise` as Path<DevisNouveauFormType>,
  });
  const typePrix = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.typePrix` as Path<DevisNouveauFormType>,
  });
  const periodeFacturation = useWatch<DevisNouveauFormType>({
    control,
    name: `lignes.${index}.periodeFacturation` as Path<DevisNouveauFormType>,
  });

  const periodeLabel =
    String(typePrix) === "abonnement" && periodeFacturation
      ? ({
          semaine: " /semaine",
          mois: " /mois",
          annee: " /an",
        }[String(periodeFacturation)] ?? "")
      : "";

  const prixTtc = calcTtcStr(
    String(prixHtEur ?? ""),
    String(tauxTva ?? "2000"),
  );

  return (
    <div className="rounded-lg border">
      {/* Header accordion */}
      <button
        type="button"
        className="hover:bg-muted/30 flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={onToggle}
      >
        <span className="text-sm font-medium">
          {String(designation) || `Élément ${index + 1}`}
        </span>
        <div className="flex items-center gap-2">
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              className="text-muted-foreground hover:text-destructive p-1"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onRemove();
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </div>
      </button>

      {/* Body accordion */}
      {isOpen && (
        <div className="space-y-3 border-t px-4 pt-3 pb-4">
          {/* Service */}
          {services.length > 0 && (
            <RhfControlledSelect<DevisNouveauFormType>
              name={`lignes.${index}.serviceId` as never}
              label="Service (optionnel)"
              placeholder="Sélectionnez un service"
              selectClassName="w-full"
            >
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nom}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          )}

          {/* Désignation */}
          <RhfInput<DevisNouveauFormType>
            label="Titre"
            name={`lignes.${index}.designation` as Path<DevisNouveauFormType>}
            placeholder="ex : Nettoyage des locaux"
          />

          {/* Description */}
          <RhfTextArea<DevisNouveauFormType>
            label="Détails (optionnel)"
            name={`lignes.${index}.description` as Path<DevisNouveauFormType>}
            placeholder="Ajoutez plus de détails"
            rows={2}
          />

          {/* Quantité + Unité + Type */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quantité + Unité (inline) */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Quantité</Label>
              <div className="flex gap-1">
                <RhfInput<DevisNouveauFormType>
                  name={`lignes.${index}.quantite` as Path<DevisNouveauFormType>}
                  type="number"
                  min="0"
                  step="0.001"
                  inputClassName="w-20 shrink-0"
                />
                <RhfComboboxInput<DevisNouveauFormType>
                  name={`lignes.${index}.unite` as Path<DevisNouveauFormType>}
                  options={devisLigneUniteCT.map((u) => ({
                    value: u.code,
                    label: u.name,
                  }))}
                  placeholder="Unité"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Type prix + Période */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Type</Label>
              <div className="flex min-w-0 gap-1 overflow-hidden">
                <RhfControlledSelect<DevisNouveauFormType>
                  name={`lignes.${index}.typePrix` as never}
                  selectClassName="w-full"
                  className="min-w-0 flex-1"
                  onChange={(v) => {
                    if (v !== "abonnement") {
                      setValue(
                        `lignes.${index}.periodeFacturation` as Path<DevisNouveauFormType>,
                        "" as never,
                      );
                    }
                  }}
                >
                  {devisTypePrixCT.map((t) => (
                    <SelectItem key={t.code} value={t.code}>
                      {t.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
                {String(typePrix) === "abonnement" && (
                  <RhfControlledSelect<DevisNouveauFormType>
                    name={`lignes.${index}.periodeFacturation` as never}
                    selectClassName="w-full"
                    className="min-w-0 flex-1"
                    placeholder="Période"
                  >
                    {devisPeriodeFacturationCT.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </RhfControlledSelect>
                )}
              </div>
            </div>
          </div>

          {/* PU HT + TVA */}
          <div className="grid grid-cols-2 gap-3">
            {/* Prix unitaire HT */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm">
                Prix unitaire (HT{periodeLabel})
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-[18px] left-3 -translate-y-1/2 text-xs">
                  EUR
                </span>
                <RhfInput<DevisNouveauFormType>
                  name={`lignes.${index}.prixUnitaireHtEur` as Path<DevisNouveauFormType>}
                  type="number"
                  min="0"
                  step="0.01"
                  inputClassName="pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* TVA */}
            <RhfControlledSelect<DevisNouveauFormType>
              name={`lignes.${index}.tauxTva` as never}
              label="TVA"
              selectClassName="w-full"
            >
              {TVA_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>

          {/* PU TTC (calculé) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm">Prix unitaire (TTC{periodeLabel})</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-[18px] left-3 -translate-y-1/2 text-xs">
                EUR
              </span>
              <Input
                value={prixTtc}
                readOnly
                disabled
                className="bg-muted/50 pl-10"
              />
            </div>
          </div>

          {/* Remise ligne */}
          {!hasRemise ? (
            <button
              type="button"
              className="text-primary flex items-center gap-1 text-xs hover:underline"
              onClick={() =>
                setValue(
                  `lignes.${index}.hasRemise` as Path<DevisNouveauFormType>,
                  true as never,
                )
              }
            >
              <Plus className="h-3 w-3" />
              Ajouter une remise
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Remise (HT{periodeLabel})</Label>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive text-xs"
                  onClick={() => {
                    setValue(
                      `lignes.${index}.hasRemise` as Path<DevisNouveauFormType>,
                      false as never,
                    );
                    setValue(
                      `lignes.${index}.remiseHtMontantEur` as Path<DevisNouveauFormType>,
                      "" as never,
                    );
                  }}
                >
                  Supprimer la remise
                </button>
              </div>
              <div className="relative">
                <span className="text-muted-foreground absolute top-[18px] left-3 -translate-y-1/2 text-xs">
                  EUR
                </span>
                <RhfInput<DevisNouveauFormType>
                  name={`lignes.${index}.remiseHtMontantEur` as Path<DevisNouveauFormType>}
                  type="number"
                  min="0"
                  step="0.01"
                  inputClassName="pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
