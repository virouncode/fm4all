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
import { devisLigneUniteCT } from "@/constants/codeTables";
import { useRouter } from "@/i18n/navigation";
import { getPresignedReadUrl } from "@/lib/s3/upload-helper";
import {
  getEntreprisesClientesAction,
  getEntrepriseContactsAction,
  getMonEntrepriseDetailsAction,
} from "@/server/actions/entreprisesActions";
import { getMesClientsAction } from "@/server/actions/clientServiceExecutionsActions";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { saveFactureWithLignesAction } from "@/server/actions/facturesActions";
import type { FactureAvecLignes } from "@/server/queries/factures.query";
import {
  factureNouvelleSchema,
  type FactureNouvelleFormType,
} from "@/zod-schemas/factures.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type Path,
} from "react-hook-form";
import { toast } from "sonner";
import type { FacturePreviewData, FacturePreviewLigne } from "../FacturePreviewCard";
import { FacturePreviewCard } from "../FacturePreviewCard";

// ============================= TYPES ==============================//

export type EmetteurInfoType = {
  id: string;
  nom: string;
  siret: string;
  numeroTva: string | null;
  logoStorageKey?: string | null;
};

type SiteOptionType = {
  id: string;
  nom: string;
  adresseLigne1: string | null;
  codePostal: string | null;
  ville: string | null;
};

type ClientOptionType = {
  id: string;
  nom: string;
  siret?: string;
  numeroTva?: string | null;
};

type ContactOptionType = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  phone: string | null;
  fonction: string | null;
};

type ServiceOptionType = {
  id: string;
  nom: string;
};

type FactureNouvelleClientProps = {
  emetteur: EmetteurInfoType | null;
  factureExistante: FactureAvecLignes | null;
  posture: "prestataire" | "plateforme";
  services: ServiceOptionType[];
};

// ============================= CONSTANTES ==============================//

const TVA_OPTIONS = [
  { value: "2000", label: "20 %" },
  { value: "1000", label: "10 %" },
  { value: "550", label: "5,5 %" },
  { value: "0", label: "0 %" },
] as const;

const DEFAULT_LIGNE: FactureNouvelleFormType["lignes"][0] = {
  serviceId: "",
  designation: "",
  description: "",
  quantite: "1",
  unite: "",
  prixUnitaireHtEur: "",
  tauxTva: "2000",
  hasRemise: false,
  remiseHtMontantEur: "",
};

// ============================= HELPERS ==============================//

function eurToCentimes(eur: string): number {
  const v = parseFloat(eur.replace(",", ".") || "0");
  return isNaN(v) ? 0 : Math.round(v * 100);
}

function centimesToEur(centimes: number): string {
  return (centimes / 100).toFixed(2);
}

function calcTtcStr(prixHtEur: string, tauxTva: string): string {
  const ht = parseFloat(prixHtEur.replace(",", ".") || "0");
  if (isNaN(ht)) return "0,00";
  const ttc = ht * (1 + Number(tauxTva) / 10000);
  return ttc.toFixed(2);
}

// ============================= PREVIEW ==============================//

type PreviewValuesType = {
  titre?: string;
  description?: string;
  notesClient?: string;
  dateEcheance?: string;
  periodeDebut?: string;
  periodeFin?: string;
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
  }>;
};

function buildPreview(
  emetteur: EmetteurInfoType | null,
  selectedClient: ClientOptionType | null,
  selectedSite: SiteOptionType | null,
  values: PreviewValuesType,
  emetteurLogoUrl: string | null,
  selectedContact: ContactOptionType | null,
): FacturePreviewData {
  const lignes = values.lignes ?? [];
  const previewLignes: FacturePreviewLigne[] = lignes.map((l) => ({
    designation: l.designation || "—",
    description: l.description || null,
    quantite: l.quantite || "0",
    unite: String(l.unite ?? ""),
    prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur ?? ""),
    tauxTva: Number(l.tauxTva ?? "2000"),
    remiseHtMontant: l.hasRemise ? eurToCentimes(l.remiseHtMontantEur ?? "") : 0,
  }));

  return {
    numero: null,
    titre: values.titre || "Nouvelle facture",
    description: values.description || null,
    notesClient: values.notesClient || null,
    statut: "brouillon",
    remiseGlobaleHt: eurToCentimes(values.remiseGlobaleHtEur ?? ""),
    dateEmission: null,
    dateEcheance: values.dateEcheance ? new Date(values.dateEcheance) : null,
    periodeDebut: values.periodeDebut || null,
    periodeFin: values.periodeFin || null,
    emetteurEntrepriseNom: emetteur?.nom ?? "",
    emetteurEntrepriseSiret: emetteur?.siret ?? "",
    emetteurEntrepriseNumeroTva: emetteur?.numeroTva ?? null,
    emetteurEmailContact: null,
    emetteurPhoneContact: null,
    emetteurPrenomContact: null,
    emetteurNomContact: null,
    emetteurLogoUrl,
    destinataireEntrepriseNom: selectedClient?.nom ?? "—",
    destinataireEntrepriseSiret: selectedClient?.siret ?? null,
    destinataireEntrepriseNumeroTva: selectedClient?.numeroTva ?? null,
    clientContactPrenom: selectedContact?.prenom ?? null,
    clientContactNom: selectedContact?.nom ?? null,
    clientContactEmail: selectedContact?.email ?? null,
    clientContactPhone: selectedContact?.phone ?? null,
    siteNom: selectedSite?.nom ?? null,
    siteAdresse: selectedSite?.adresseLigne1 ?? null,
    siteCodePostal: selectedSite?.codePostal ?? null,
    siteVille: selectedSite?.ville ?? null,
    lignes: previewLignes,
  };
}

// ============================= COMPOSANT ==============================//

export function FactureNouvelleClient({
  emetteur,
  factureExistante,
  posture,
  services,
}: FactureNouvelleClientProps) {
  const router = useRouter();

  const isEdit = !!factureExistante;

  const [step, setStep] = useState<1 | 2>(1);
  const [clients, setClients] = useState<ClientOptionType[]>([]);
  const [sites, setSites] = useState<SiteOptionType[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOptionType | null>(null);
  const [selectedSite, setSelectedSite] = useState<SiteOptionType | null>(null);
  const [contacts, setContacts] = useState<ContactOptionType[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOptionType | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [openLines, setOpenLines] = useState<Set<number>>(new Set([0]));
  const [emetteurLogoUrl, setEmetteurLogoUrl] = useState<string | null>(null);

  // Charger l'URL du logo de l'émetteur
  useEffect(() => {
    if (!emetteur?.logoStorageKey) return;
    getPresignedReadUrl({
      key: emetteur.logoStorageKey,
      proprietaireEntrepriseId: emetteur.id,
    })
      .then(setEmetteurLogoUrl)
      .catch(() => null);
  }, [emetteur?.logoStorageKey, emetteur?.id]);

  const form = useForm<FactureNouvelleFormType>({
    resolver: zodResolver(factureNouvelleSchema),
    mode: "onTouched",
    defaultValues: isEdit && factureExistante
      ? {
          emetteurEntrepriseId: factureExistante.emetteurEntrepriseId,
          destinataireEntrepriseId: factureExistante.destinataireEntrepriseId,
          proprietaireEntrepriseId: factureExistante.proprietaireEntrepriseId,
          siteId: factureExistante.siteId ?? "",
          modeCommercialSnapshot: factureExistante.modeCommercialSnapshot ?? (posture === "plateforme" ? "intermediaire" : "direct"),
          titre: factureExistante.titre,
          description: factureExistante.description ?? "",
          noteInterne: factureExistante.noteInterne ?? "",
          notesClient: factureExistante.notesClient ?? "",
          dateEcheance: factureExistante.dateEcheance
            ? new Date(factureExistante.dateEcheance).toISOString().split("T")[0]
            : "",
          periodeDebut: factureExistante.periodeDebut ?? "",
          periodeFin: factureExistante.periodeFin ?? "",
          remiseGlobaleHtEur: centimesToEur(factureExistante.remiseGlobaleHt ?? 0),
          lignes: factureExistante.lignes.map((l) => ({
            serviceId: l.serviceId ?? "",
            designation: l.designation,
            description: l.description ?? "",
            quantite: l.quantite,
            unite: l.unite,
            prixUnitaireHtEur: centimesToEur(l.prixUnitaireHt),
            tauxTva: String(l.tauxTva ?? 2000),
            hasRemise: (l.remiseHtMontant ?? 0) > 0,
            remiseHtMontantEur: centimesToEur(l.remiseHtMontant ?? 0),
          })),
        }
      : {
          emetteurEntrepriseId: emetteur?.id ?? "",
          destinataireEntrepriseId: "",
          proprietaireEntrepriseId: "",
          siteId: "",
          contactId: undefined,
          modeCommercialSnapshot: posture === "plateforme" ? "intermediaire" : "direct",
          titre: "",
          description: "",
          noteInterne: "",
          notesClient: "",
          dateEcheance: "",
          periodeDebut: "",
          periodeFin: "",
          remiseGlobaleHtEur: "",
          lignes: [{ ...DEFAULT_LIGNE }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lignes",
  });

  const watchedValues = useWatch({ control: form.control });

  // ─── Chargement des clients ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingClients(true);
      try {
        if (posture === "prestataire") {
          const result = await getMesClientsAction({ entrepriseId: emetteur?.id ?? "" });
          if (result?.data?.clients) {
            setClients(result.data.clients.map((c) => ({
              id: c.id,
              nom: c.nom,
              siret: c.siret,
              numeroTva: c.numeroTva,
            })));
          }
        } else {
          const result = await getEntreprisesClientesAction();
          if (result?.data?.clients) {
            setClients(result.data.clients.map((c) => ({ id: c.id, nom: c.nom })));
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setLoadingClients(false);
      }
    }
    void load();
  }, [posture, emetteur?.id]);

  // ─── Chargement des sites pour un client ────────────────────────
  async function loadSitesForClient(clientId: string) {
    if (!clientId) {
      setSites([]);
      setSelectedSite(null);
      form.setValue("siteId", "");
      return;
    }
    setLoadingSites(true);
    try {
      const result = await getAccessibleSitesAction({ entrepriseId: clientId });
      if (result?.data) {
        setSites(result.data.map((s) => ({
          id: s.id,
          nom: s.nom,
          adresseLigne1: s.adresseLigne1 ?? null,
          codePostal: s.codePostal ?? null,
          ville: s.ville ?? null,
        })));
      }
    } catch {
      toast.error("Erreur lors du chargement des sites");
    } finally {
      setLoadingSites(false);
    }
  }

  // ─── Chargement des contacts d'un client ─────────────────────────
  async function loadContactsForClient(clientId: string) {
    if (!clientId) {
      setContacts([]);
      setSelectedContact(null);
      form.setValue("contactId", undefined);
      return;
    }
    setLoadingContacts(true);
    try {
      const result = await getEntrepriseContactsAction({ entrepriseId: clientId });
      if (result?.data?.contacts) {
        setContacts(
          result.data.contacts.map((c) => ({
            id: c.id,
            prenom: c.prenom,
            nom: c.nom,
            email: c.email ?? null,
            phone: c.phone ?? null,
            fonction: c.fonction ?? null,
          })),
        );
      }
    } catch {
      // Non bloquant
    } finally {
      setLoadingContacts(false);
    }
  }

  // ─── Changement de client ─────────────────────────────────────────
  // Pour prestataire : clients ont déjà siret/tva (getMesClientsAction)
  // Pour plateforme : enrichissement via getMonEntrepriseDetailsAction
  async function handleClientChange(clientId: string) {
    const clientFromList = clients.find((c) => c.id === clientId) ?? null;
    setSelectedClient(clientFromList);
    setSelectedSite(null);
    setSelectedContact(null);
    form.setValue("siteId", "");
    form.setValue("contactId", undefined);
    void loadSitesForClient(clientId);
    void loadContactsForClient(clientId);

    // Enrichir avec siret/TVA si absent (posture plateforme)
    if (clientFromList && clientFromList.siret === undefined) {
      try {
        const result = await getMonEntrepriseDetailsAction({ entrepriseId: clientId });
        if (result?.data?.entreprise) {
          setSelectedClient({
            id: clientId,
            nom: result.data.entreprise.nom,
            siret: result.data.entreprise.siret,
            numeroTva: result.data.entreprise.numeroTva ?? null,
          });
        }
      } catch {
        // On garde clientFromList sans siret
      }
    }
  }

  // ─── Skip first mount pour le reset siteId en mode edit ──────────
  const isFirstMount = useRef(true);

  // ─── Step 1 → 2 ──────────────────────────────────────────────────
  async function handleContinuer() {
    const valid = await form.trigger(["destinataireEntrepriseId", "titre"]);
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
  async function onSubmit(data: FactureNouvelleFormType) {
    if (!data.destinataireEntrepriseId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    try {
      const result = await saveFactureWithLignesAction({
        ...(isEdit && factureExistante ? { id: factureExistante.id } : {}),
        emetteurEntrepriseId: data.emetteurEntrepriseId,
        destinataireEntrepriseId: data.destinataireEntrepriseId,
        proprietaireEntrepriseId: data.destinataireEntrepriseId,
        siteId: data.siteId || undefined,
        titre: data.titre.trim(),
        description: data.description.trim() || undefined,
        noteInterne: data.noteInterne.trim() || undefined,
        notesClient: data.notesClient.trim() || undefined,
        dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : undefined,
        periodeDebut: data.periodeDebut || undefined,
        periodeFin: data.periodeFin || undefined,
        remiseGlobaleHt: eurToCentimes(data.remiseGlobaleHtEur),
        modeCommercialSnapshot: (data.modeCommercialSnapshot as "direct" | "intermediaire") || "direct",
        lignes: data.lignes.map((l, i) => ({
          serviceId: l.serviceId || undefined,
          designation: l.designation.trim() || "—",
          description: l.description.trim() || undefined,
          quantite: l.quantite || "1",
          unite: l.unite,
          prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur),
          tauxTva: Number(l.tauxTva),
          remiseHtMontant: l.hasRemise ? eurToCentimes(l.remiseHtMontantEur) : 0,
          ordre: i,
        })),
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data) {
        toast.success(isEdit ? "Facture mise à jour" : "Facture enregistrée");
        router.push({
          pathname: "/app/factures/[factureId]",
          params: { factureId: result.data.facture.id },
        });
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
    selectedContact,
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
              step === 2 ? setStep(1) : router.push("/app/factures")
            }
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 2 ? "Retour" : "Annuler"}
          </Button>
          <span className="text-muted-foreground text-sm">
            {isEdit ? "Modifier la facture" : "Nouvelle facture"} — étape {step}/2
          </span>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 ? (
                <Step1
                  emetteur={emetteur}
                  posture={posture}
                  clients={clients}
                  loadingClients={loadingClients}
                  sites={sites}
                  loadingSites={loadingSites}
                  contacts={contacts}
                  loadingContacts={loadingContacts}
                  onClientChange={(clientId) => void handleClientChange(clientId)}
                  onSiteChange={(siteId) => {
                    if (siteId === "none") {
                      setSelectedSite(null);
                      form.setValue("siteId", "");
                    } else {
                      const site = sites.find((s) => s.id === siteId) ?? null;
                      setSelectedSite(site);
                    }
                  }}
                  onContactChange={(contactId) => {
                    if (contactId === "none") {
                      setSelectedContact(null);
                      form.setValue("contactId", "");
                    } else {
                      const contact = contacts.find((c) => c.id === contactId) ?? null;
                      setSelectedContact(contact);
                    }
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
                  isEdit={isEdit}
                  services={services}
                />
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* ── Preview A4 ── */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-16 dark:bg-gray-950">
        <div
          className="shrink-0"
          style={{
            width: "calc(210mm * 0.75)",
            height: "calc(297mm * 0.75)",
            overflow: "hidden",
          }}
        >
          <div style={{ transform: "scale(0.75)", transformOrigin: "top left" }}>
            <FacturePreviewCard facture={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================= ÉTAPE 1 ==============================//

type Step1Props = {
  emetteur: EmetteurInfoType | null;
  posture: "prestataire" | "plateforme";
  clients: ClientOptionType[];
  loadingClients: boolean;
  sites: SiteOptionType[];
  loadingSites: boolean;
  contacts: ContactOptionType[];
  loadingContacts: boolean;
  onClientChange: (id: string) => void;
  onSiteChange: (id: string) => void;
  onContactChange: (id: string) => void;
  onContinuer: () => void;
};

function Step1({
  emetteur,
  posture,
  clients,
  loadingClients,
  sites,
  loadingSites,
  contacts,
  loadingContacts,
  onClientChange,
  onSiteChange,
  onContactChange,
  onContinuer,
}: Step1Props) {
  const destinataireId = useWatch<FactureNouvelleFormType, "destinataireEntrepriseId">({
    name: "destinataireEntrepriseId",
  });

  return (
    <div className="space-y-8">
      {/* Émetteur */}
      {emetteur && (
        <section>
          <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
            Émetteur
          </h2>
          <div className="space-y-1 rounded-lg border p-4">
            <p className="font-semibold">{emetteur.nom}</p>
            <p className="text-muted-foreground text-sm">SIRET : {emetteur.siret}</p>
            <p className="text-muted-foreground text-sm">
              Mode commercial :{" "}
              {posture === "plateforme" ? "Intermédiation FM4ALL" : "Prestation directe"}
            </p>
          </div>
        </section>
      )}

      {/* Coordonnées du client */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Coordonnées du client
        </h2>

        <div className="space-y-4">
          <RhfControlledSelect<FactureNouvelleFormType>
            name="destinataireEntrepriseId"
            label="Client (destinataire)"
            requiredMark
            placeholder={loadingClients ? "Chargement…" : "Sélectionnez un client"}
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

          <RhfControlledSelect<FactureNouvelleFormType>
            name="siteId"
            label="Site (optionnel)"
            placeholder={
              !destinataireId
                ? "Choisissez d'abord un client"
                : loadingSites
                  ? "Chargement…"
                  : sites.length === 0
                    ? "Aucun site disponible"
                    : "Sélectionnez un site"
            }
            disabled={!destinataireId || loadingSites}
            onChange={(v) => onSiteChange(String(v))}
            selectClassName="w-full"
          >
            <SelectItem value="none">
              <span className="italic text-muted-foreground">Pas de site</span>
            </SelectItem>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nom}
              </SelectItem>
            ))}
          </RhfControlledSelect>

          <RhfControlledSelect<FactureNouvelleFormType>
            name="contactId"
            label="Contact (optionnel)"
            placeholder={
              !destinataireId
                ? "Choisissez d'abord un client"
                : loadingContacts
                  ? "Chargement…"
                  : contacts.length === 0
                    ? "Aucun contact disponible"
                    : "Sélectionnez un contact"
            }
            disabled={!destinataireId || loadingContacts || contacts.length === 0}
            onChange={(v) => onContactChange(String(v))}
            selectClassName="w-full"
          >
            <SelectItem value="none">
              <span className="italic text-muted-foreground">Pas de contact</span>
            </SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.prenom} {c.nom}
                {c.fonction ? ` — ${c.fonction}` : ""}
              </SelectItem>
            ))}
          </RhfControlledSelect>
        </div>
      </section>

      {/* Détails de la facture */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Détails de la facture
        </h2>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Numéro de facture</span>
            <span className="font-mono text-xs italic">Attribué à l&apos;émission</span>
          </div>

          <RhfInput<FactureNouvelleFormType>
            name="titre"
            label="Titre de la facture"
            requiredMark
            placeholder="ex : Prestations de nettoyage – Mars 2026"
          />

          <RhfDatePicker<FactureNouvelleFormType>
            name="dateEcheance"
            label="Date d'échéance"
          />

          <div className="grid grid-cols-2 gap-3">
            <RhfDatePicker<FactureNouvelleFormType>
              name="periodeDebut"
              label="Période début"
            />
            <RhfDatePicker<FactureNouvelleFormType>
              name="periodeFin"
              label="Période fin"
            />
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
  fields: ReturnType<typeof useFieldArray<FactureNouvelleFormType, "lignes">>["fields"];
  openLines: Set<number>;
  onToggleLine: (index: number) => void;
  onAddLigne: () => void;
  onRemoveLigne: (index: number) => void;
  isSubmitting: boolean;
  isEdit: boolean;
  services: ServiceOptionType[];
};

function Step2({
  fields,
  openLines,
  onToggleLine,
  onAddLigne,
  onRemoveLigne,
  isSubmitting,
  isEdit,
  services,
}: Step2Props) {
  return (
    <div className="space-y-8 pb-6">
      {/* Produits et services */}
      <section>
        <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Lignes de facturation
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
          Ajouter une ligne
        </Button>
      </section>

      {/* Remise globale */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Remise sur le total
        </h2>
        <div className="flex items-center gap-2">
          <RhfInput<FactureNouvelleFormType>
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

      {/* Description (visible client) */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Description{" "}
          <span className="font-normal normal-case">(visible par le client)</span>
        </h2>
        <RhfTextArea<FactureNouvelleFormType>
          name="description"
          placeholder="Ajoutez des précisions sur la facture, conditions particulières…"
          rows={3}
        />
      </section>

      {/* Notes client */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Notes client{" "}
          <span className="font-normal normal-case">(visible par le client)</span>
        </h2>
        <RhfTextArea<FactureNouvelleFormType>
          name="notesClient"
          placeholder="Conditions de paiement, coordonnées bancaires…"
          rows={3}
        />
      </section>

      {/* Note interne */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Note interne{" "}
          <span className="font-normal normal-case">(non imprimée)</span>
        </h2>
        <RhfTextArea<FactureNouvelleFormType>
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
        {isSubmitting
          ? "Enregistrement…"
          : isEdit
            ? "Enregistrer les modifications"
            : "Enregistrer le brouillon"}
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
  const { control, setValue } = useFormContext<FactureNouvelleFormType>();

  const designation = useWatch<FactureNouvelleFormType>({
    control,
    name: `lignes.${index}.designation` as Path<FactureNouvelleFormType>,
  });
  const prixHtEur = useWatch<FactureNouvelleFormType>({
    control,
    name: `lignes.${index}.prixUnitaireHtEur` as Path<FactureNouvelleFormType>,
  });
  const tauxTva = useWatch<FactureNouvelleFormType>({
    control,
    name: `lignes.${index}.tauxTva` as Path<FactureNouvelleFormType>,
  });
  const hasRemise = useWatch<FactureNouvelleFormType>({
    control,
    name: `lignes.${index}.hasRemise` as Path<FactureNouvelleFormType>,
  });

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
            <RhfControlledSelect<FactureNouvelleFormType>
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
          <RhfInput<FactureNouvelleFormType>
            label="Titre"
            name={`lignes.${index}.designation` as Path<FactureNouvelleFormType>}
            placeholder="ex : Nettoyage des locaux"
          />

          {/* Description */}
          <RhfTextArea<FactureNouvelleFormType>
            label="Détails (optionnel)"
            name={`lignes.${index}.description` as Path<FactureNouvelleFormType>}
            placeholder="Ajoutez plus de détails"
            rows={2}
          />

          {/* Quantité + Unité */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Quantité</Label>
            <div className="flex gap-1">
              <RhfInput<FactureNouvelleFormType>
                name={`lignes.${index}.quantite` as Path<FactureNouvelleFormType>}
                type="number"
                min="0"
                step="0.001"
                inputClassName="w-20 shrink-0"
              />
              <RhfComboboxInput<FactureNouvelleFormType>
                name={`lignes.${index}.unite` as Path<FactureNouvelleFormType>}
                options={devisLigneUniteCT.map((u) => ({
                  value: u.code,
                  label: u.name,
                }))}
                placeholder="Unité"
                className="flex-1"
              />
            </div>
          </div>

          {/* PU HT + TVA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Prix unitaire (HT)</Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-[18px] left-3 -translate-y-1/2 text-xs">
                  EUR
                </span>
                <RhfInput<FactureNouvelleFormType>
                  name={`lignes.${index}.prixUnitaireHtEur` as Path<FactureNouvelleFormType>}
                  type="number"
                  min="0"
                  step="0.01"
                  inputClassName="pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>

            <RhfControlledSelect<FactureNouvelleFormType>
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
            <Label className="text-sm">Prix unitaire (TTC)</Label>
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
                  `lignes.${index}.hasRemise` as Path<FactureNouvelleFormType>,
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
                <Label className="text-sm">Remise (HT)</Label>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive text-xs"
                  onClick={() => {
                    setValue(
                      `lignes.${index}.hasRemise` as Path<FactureNouvelleFormType>,
                      false as never,
                    );
                    setValue(
                      `lignes.${index}.remiseHtMontantEur` as Path<FactureNouvelleFormType>,
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
                <RhfInput<FactureNouvelleFormType>
                  name={`lignes.${index}.remiseHtMontantEur` as Path<FactureNouvelleFormType>}
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
