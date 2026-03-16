"use client";

import { RhfComboboxInput } from "@/components/rhf/RhfComboboxInput";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDatePicker } from "@/components/rhf/RhfDatePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Badge } from "@/components/ui/badge";
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
import { Link, useRouter } from "@/i18n/navigation";
import { getPresignedReadUrl, uploadFileToS3 } from "@/lib/s3/upload-helper";
import {
  emettreDevisAction,
  refuserDevisAction,
  saveDevisPdfAction,
  saveDevisWithLignesAction,
  signerDevisAction,
} from "@/server/actions/devisActions";
import type { DevisAvecLignes } from "@/server/queries/devis.query";
import {
  devisEditSchema,
  type DevisEditFormType,
} from "@/zod-schemas/devis.schema";
import type {
  DevisPeriodeFacturationType,
  DevisTypePrixType,
} from "@/zod-schemas/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Plus,
  Printer,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
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
import { getDevisStatutBadge } from "../helpers";

// ============================= TYPES ==============================//

type ServiceOptionType = {
  id: string;
  nom: string;
};

type PermissionsType = {
  canEdit: boolean;
  canEmettre: boolean;
  canSigner: boolean;
  canRefuser: boolean;
  isReadOnly: boolean;
  isExpired: boolean;
};

type Props = {
  devis: DevisAvecLignes;
  permissions: PermissionsType;
  services: ServiceOptionType[];
  pdfStorageKey?: string | null;
  backTab?: "propositions" | "demandes";
};

// ============================= CONSTANTES ==============================//

const TVA_OPTIONS = [
  { value: "2000", label: "20 %" },
  { value: "1000", label: "10 %" },
  { value: "550", label: "5,5 %" },
  { value: "0", label: "0 %" },
] as const;

// ============================= HELPERS ==============================//

function eurToCentimes(eur: string): number {
  const v = parseFloat(eur.replace(",", ".") || "0");
  return isNaN(v) ? 0 : Math.round(v * 100);
}

function centimesToEurStr(c: number): string {
  return (c / 100).toFixed(2);
}

function calcTtcStr(prixHtEur: string, tauxTva: string): string {
  const ht = parseFloat(prixHtEur.replace(",", ".") || "0");
  if (isNaN(ht)) return "0,00";
  const ttc = ht * (1 + Number(tauxTva) / 10000);
  return ttc.toFixed(2);
}

// Type permissif pour useWatch (DeepPartial — tous les champs optionnels)
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
  devis: DevisAvecLignes,
  values: PreviewValuesType,
  emetteurLogoUrl: string | null,
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
    numero: devis.numero,
    titre: values.titre || devis.titre,
    description: values.description || null,
    statut: devis.statut,
    remiseGlobaleHt: eurToCentimes(values.remiseGlobaleHtEur ?? ""),
    dateEmission: devis.dateEmission,
    validTo: values.validTo ? new Date(values.validTo) : devis.validTo,
    updatedAt: devis.updatedAt,
    emetteurEntrepriseNom: devis.emetteurEntrepriseNom,
    emetteurEntrepriseSiret: devis.emetteurEntrepriseSiret,
    emetteurEntrepriseNumeroTva: devis.emetteurEntrepriseNumeroTva,
    emetteurEmailContact: devis.emetteurEmailContact,
    emetteurPhoneContact: devis.emetteurPhoneContact,
    emetteurPrenomContact: devis.emetteurPrenomContact,
    emetteurNomContact: devis.emetteurNomContact,
    emetteurLogoUrl,
    proprietaireEntrepriseNom: devis.proprietaireEntrepriseNom,
    proprietaireEntrepriseSiret: devis.proprietaireEntrepriseSiret,
    proprietaireEntrepriseNumeroTva: devis.proprietaireEntrepriseNumeroTva,
    siteNom: devis.siteNom,
    siteAdresse: devis.siteAdresse,
    siteCodePostal: devis.siteCodePostal,
    siteVille: devis.siteVille,
    clientContactPrenom: devis.siteResponsablePrenom,
    clientContactNom: devis.siteResponsableNom,
    clientContactEmail: devis.siteResponsableEmail,
    clientContactPhone: devis.siteResponsablePhone,
    lignes: previewLignes,
  };
}

// ============================= COMPOSANT PRINCIPAL ==============================//

export function DevisDetailClient({
  devis: initialDevis,
  permissions,
  services,
  pdfStorageKey: initialPdfStorageKey,
  backTab,
}: Props) {
  const backHref = backTab
    ? ({ pathname: "/app/devis", query: { tab: backTab } } as const)
    : ({ pathname: "/app/devis" } as const);
  const router = useRouter();
  const [devis, setDevis] = useState(initialDevis);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfStorageKey, setPdfStorageKey] = useState<string | null>(
    initialPdfStorageKey ?? null,
  );
  const [emetteurLogoUrl, setEmetteurLogoUrl] = useState<string | null>(null);
  const [openLines, setOpenLines] = useState<Set<number>>(new Set());
  const pdfRef = useRef<HTMLDivElement>(null);

  // Charger le logo de l'émetteur en data URL (pour html2canvas — CORS)
  useEffect(() => {
    if (!initialDevis.emetteurLogoStorageKey) return;
    getPresignedReadUrl({
      key: initialDevis.emetteurLogoStorageKey,
      proprietaireEntrepriseId: initialDevis.emetteurEntrepriseId,
    })
      .then(async (url) => {
        try {
          const resp = await fetch(url);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setEmetteurLogoUrl(dataUrl);
        } catch {
          setEmetteurLogoUrl(url); // fallback si fetch échoue
        }
      })
      .catch(() => null);
  }, [initialDevis.emetteurLogoStorageKey, initialDevis.emetteurEntrepriseId]);

  const form = useForm<DevisEditFormType>({
    resolver: zodResolver(devisEditSchema),
    mode: "onTouched",
    defaultValues: {
      titre: initialDevis.titre,
      validTo: initialDevis.validTo
        ? new Date(initialDevis.validTo).toISOString().slice(0, 10)
        : "",
      description: initialDevis.description ?? "",
      noteInterne: initialDevis.noteInterne ?? "",
      remiseGlobaleHtEur:
        initialDevis.remiseGlobaleHt > 0
          ? centimesToEurStr(initialDevis.remiseGlobaleHt)
          : "",
      lignes: initialDevis.lignes.map((l) => ({
        serviceId: l.serviceId ?? "",
        designation: l.designation,
        description: l.description ?? "",
        quantite: String(l.quantite),
        unite: l.unite,
        prixUnitaireHtEur: centimesToEurStr(l.prixUnitaireHt),
        tauxTva: String(l.tauxTva),
        hasRemise: l.remiseHtMontant > 0,
        remiseHtMontantEur:
          l.remiseHtMontant > 0 ? centimesToEurStr(l.remiseHtMontant) : "",
        typePrix: l.typePrix as DevisTypePrixType,
        periodeFacturation: l.periodeFacturation ?? "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lignes",
  });

  const { isSubmitting, isDirty } = form.formState;

  // useWatch pour la preview live (évite form.watch() dans le render)
  const watchedValues = useWatch({ control: form.control });

  // Permissions effectives dérivées du statut local (change après émission/signature/refus)
  const effectivePermissions: PermissionsType = {
    canEdit: permissions.canEdit && devis.statut === "brouillon",
    canEmettre: permissions.canEmettre && devis.statut === "brouillon",
    canSigner: permissions.canSigner && devis.statut === "emis",
    canRefuser: permissions.canRefuser && devis.statut === "emis",
    isReadOnly: permissions.isReadOnly || devis.statut !== "brouillon",
    isExpired: permissions.isExpired,
  };

  const badge = getDevisStatutBadge(devis.statut);
  const preview = buildPreview(devis, watchedValues, emetteurLogoUrl);

  // ─── Gestion lignes ──────────────────────────────────────────────
  function handleAddLigne() {
    append({
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
    });
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

  function toggleLine(index: number) {
    setOpenLines((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // ─── Transitions statut ──────────────────────────────────────────
  async function handleGenerateAndSavePdf(devisNumero: string) {
    if (!pdfRef.current) return;
    setIsPdfGenerating(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { PDFDocument } = await import("pdf-lib");

      // Convertir le logo en data URL pour éviter les problèmes CORS avec html2canvas
      if (emetteurLogoUrl) {
        const imgEl = pdfRef.current.querySelector(
          "img",
        ) as HTMLImageElement | null;
        if (imgEl) {
          try {
            const resp = await fetch(emetteurLogoUrl);
            const blob = await resp.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            imgEl.src = dataUrl;
            await new Promise<void>((resolve) => {
              imgEl.onload = () => resolve();
              imgEl.onerror = () => resolve(); // continuer même si erreur
            });
          } catch {
            // Continuer sans logo si erreur
          }
        }
      }

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfDoc = await PDFDocument.create();
      // Page A4 fixe : 595pt × 842pt (210mm × 297mm)
      const pageWidth = 595;
      const pageHeight = 842;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const pngImage = await pdfDoc.embedPng(imgData);
      // Hauteur du contenu en pt (proportionnelle à la largeur A4)
      const contentHeightPt = Math.round(
        (canvas.height / canvas.width) * pageWidth,
      );
      // pdf-lib : origine en bas à gauche → dessiner depuis le haut de la page
      const drawY = pageHeight - Math.min(contentHeightPt, pageHeight);
      page.drawImage(pngImage, {
        x: 0,
        y: drawY,
        width: pageWidth,
        height: Math.min(contentHeightPt, pageHeight),
      });

      const pdfBytes = await pdfDoc.save();
      const filename = `devis-${devisNumero}.pdf`;
      const file = new File([pdfBytes.buffer as ArrayBuffer], filename, {
        type: "application/pdf",
      });

      const { key: tempKey } = await uploadFileToS3({
        file,
        proprietaireEntrepriseId: devis.emetteurEntrepriseId,
        categorie: "devis",
      });

      const saveResult = await saveDevisPdfAction({
        devisId: devis.id,
        tempKey,
        filename,
        sizeBytes: pdfBytes.byteLength,
      });

      if (saveResult?.data?.storageKey) {
        setPdfStorageKey(saveResult.data.storageKey);
      }
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsPdfGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!pdfStorageKey) return;
    try {
      const url = await getPresignedReadUrl({
        key: pdfStorageKey,
        proprietaireEntrepriseId: devis.emetteurEntrepriseId,
      });
      // Fetch en blob pour forcer le téléchargement sans quitter la page
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `devis-${devis.numero ?? devis.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement du PDF");
    }
  }

  async function handleEmettre() {
    setIsTransitioning(true);
    try {
      const result = await emettreDevisAction({ devisId: devis.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.devis) {
        setDevis((prev) => ({ ...prev, ...result.data!.devis }));
        const numero = result.data.devis.numero ?? devis.id;
        toast.success(`Devis ${numero} émis avec succès`);
        // Générer et enregistrer le PDF après émission
        await handleGenerateAndSavePdf(numero);
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  async function handleSigner() {
    setIsTransitioning(true);
    try {
      const result = await signerDevisAction({ devisId: devis.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.devis) {
        setDevis((prev) => ({ ...prev, ...result.data!.devis }));
        toast.success("Devis signé avec succès");
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  async function handleRefuser() {
    setIsTransitioning(true);
    try {
      const result = await refuserDevisAction({ devisId: devis.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.devis) {
        setDevis((prev) => ({ ...prev, ...result.data!.devis }));
        toast.success("Devis refusé");
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  // ─── Sauvegarde ──────────────────────────────────────────────────
  async function onSubmit(data: DevisEditFormType) {
    const result = await saveDevisWithLignesAction({
      id: devis.id,
      proprietaireEntrepriseId: devis.proprietaireEntrepriseId,
      emetteurEntrepriseId: devis.emetteurEntrepriseId,
      demandeurEntrepriseId: devis.demandeurEntrepriseId,
      siteId: devis.siteId,
      titre: data.titre.trim(),
      description: data.description.trim() || undefined,
      noteInterne: data.noteInterne.trim() || undefined,
      remiseGlobaleHt: data.remiseGlobaleHtEur
        ? eurToCentimes(data.remiseGlobaleHtEur)
        : undefined,
      validTo: data.validTo ? new Date(data.validTo) : undefined,
      lignes: data.lignes.map((l, idx) => ({
        serviceId: l.serviceId || undefined,
        designation: l.designation.trim(),
        description: l.description.trim() || undefined,
        quantite: l.quantite || "1",
        unite: l.unite,
        prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur),
        tauxTva: Number(l.tauxTva),
        remiseHtMontant: l.hasRemise ? eurToCentimes(l.remiseHtMontantEur) : 0,
        typePrix: l.typePrix as DevisTypePrixType,
        periodeFacturation:
          l.typePrix === "abonnement" && l.periodeFacturation
            ? (l.periodeFacturation as DevisPeriodeFacturationType)
            : undefined,
        ordre: idx,
      })),
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Devis sauvegardé");
    router.push(backHref);
  }

  const disabled = isSubmitting || isTransitioning;

  // ============================= RENDER ==============================//

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Panneau gauche ── */}
      <div className="flex w-[40%] flex-col overflow-hidden border-r">
        {/* Header fixe */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Badge className={`text-xs ${badge.className}`}>
              {badge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {effectivePermissions.canEmettre && (
              <Button
                size="sm"
                disabled={disabled || isPdfGenerating}
                onClick={handleEmettre}
              >
                {isPdfGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isPdfGenerating ? "Génération PDF…" : "Émettre"}
              </Button>
            )}
            {pdfStorageKey && (
              <>
                <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title="Imprimer le devis"
                  onClick={async () => {
                    const url = await getPresignedReadUrl({
                      key: pdfStorageKey,
                      proprietaireEntrepriseId: devis.emetteurEntrepriseId,
                    });
                    window.open(url, "_blank");
                  }}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {effectivePermissions.canEdit ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-8 pb-6">
                  {/* Détails du devis */}
                  <section>
                    <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
                      Détails du devis
                    </h2>
                    <div className="space-y-4 rounded-lg border p-4">
                      <RhfInput<DevisEditFormType>
                        name="titre"
                        label="Titre du devis"
                        requiredMark
                        placeholder="ex : Nettoyage locaux Q1 2026"
                      />
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm">
                          Date d&apos;expiration
                        </Label>
                        <div className="mb-1 flex flex-wrap gap-2">
                          {([15, 30, 90] as const).map((days) => (
                            <Button
                              key={days}
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + days);
                                form.setValue(
                                  "validTo",
                                  d.toISOString().slice(0, 10),
                                );
                              }}
                            >
                              Dans {days} jours
                            </Button>
                          ))}
                        </div>
                        <RhfDatePicker<DevisEditFormType> name="validTo" />
                      </div>
                    </div>
                  </section>

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
                          onToggle={() => toggleLine(index)}
                          onRemove={() => handleRemoveLigne(index)}
                          services={services}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary mt-3"
                      onClick={handleAddLigne}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Ajouter un élément
                    </Button>
                  </section>

                  {/* Remise sur le total */}
                  <section>
                    <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                      Remise sur le total
                    </h2>
                    <div className="flex items-center gap-2">
                      <RhfInput<DevisEditFormType>
                        name="remiseGlobaleHtEur"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="max-w-48"
                      />
                      <span className="text-muted-foreground text-sm">
                        EUR HT
                      </span>
                    </div>
                  </section>

                  {/* Description */}
                  <section>
                    <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                      Description{" "}
                      <span className="font-normal normal-case">
                        (visible par le client)
                      </span>
                    </h2>
                    <RhfTextArea<DevisEditFormType>
                      name="description"
                      placeholder="Ajoutez des précisions sur le devis, conditions particulières…"
                      rows={3}
                    />
                  </section>

                  {/* Note interne */}
                  <section>
                    <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                      Note interne{" "}
                      <span className="font-normal normal-case">
                        (non imprimée)
                      </span>
                    </h2>
                    <RhfTextArea<DevisEditFormType>
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
                    disabled={disabled || !isDirty}
                  >
                    {isSubmitting
                      ? "Enregistrement…"
                      : "Enregistrer le brouillon"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            // ===== MODE LECTURE SEULE =====
            <ReadOnlyDevisViewType
              devis={devis}
              permissions={effectivePermissions}
            />
          )}
        </div>
      </div>

      {/* ── Preview A4 ── */}
      <div className="flex flex-1 flex-col overflow-auto bg-gray-100 dark:bg-gray-950">
        {/* Boutons signer / refuser au-dessus du preview */}
        {permissions.isExpired && devis.statut === "emis" ? (
          <div className="flex shrink-0 justify-center px-8 pt-4 pb-2">
            <p className="text-destructive text-sm font-medium">
              Ce devis est expiré et ne peut plus être signé.
            </p>
          </div>
        ) : (
          (effectivePermissions.canSigner ||
            effectivePermissions.canRefuser) && (
            <div className="flex shrink-0 justify-center gap-3 px-8 pt-4 pb-2">
              {effectivePermissions.canSigner && (
                <Button disabled={disabled} onClick={handleSigner}>
                  <CheckCircle className="h-4 w-4" />
                  Signer le devis
                </Button>
              )}
              {effectivePermissions.canRefuser && (
                <Button
                  variant="destructive"
                  disabled={disabled}
                  onClick={handleRefuser}
                >
                  <XCircle className="h-4 w-4" />
                  Refuser le devis
                </Button>
              )}
            </div>
          )
        )}
        <div
          className={`flex flex-1 items-start justify-center ${effectivePermissions.canSigner || effectivePermissions.canRefuser ? "px-8 pt-3 pb-8" : "p-8"}`}
        >
          {/* Wrapper aux dimensions scalées — évite que transform réserve l'espace A4 complet */}
          <div
            className="shrink-0 rounded shadow-md ring-1 ring-gray-200 dark:ring-gray-700"
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

        {/* ── Preview pleine taille hors-écran pour génération PDF ── */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}
        >
          <div ref={pdfRef}>
            <DevisPreviewCard devis={preview} pdfMode />
          </div>
        </div>
      </div>
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
  const { control, setValue } = useFormContext<DevisEditFormType>();

  // useWatch pour affichage accordion header + calcul TTC
  const designation = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.designation` as Path<DevisEditFormType>,
  });
  const prixHtEur = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.prixUnitaireHtEur` as Path<DevisEditFormType>,
  });
  const tauxTva = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.tauxTva` as Path<DevisEditFormType>,
  });
  const hasRemise = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.hasRemise` as Path<DevisEditFormType>,
  });
  const typePrix = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.typePrix` as Path<DevisEditFormType>,
  });
  const periodeFacturation = useWatch<DevisEditFormType>({
    control,
    name: `lignes.${index}.periodeFacturation` as Path<DevisEditFormType>,
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
            <RhfControlledSelect<DevisEditFormType>
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
          <RhfInput<DevisEditFormType>
            label="Titre"
            name={`lignes.${index}.designation` as Path<DevisEditFormType>}
            placeholder="ex : Nettoyage des locaux"
          />

          {/* Description */}
          <RhfTextArea<DevisEditFormType>
            label="Détails (optionnel)"
            name={`lignes.${index}.description` as Path<DevisEditFormType>}
            placeholder="Ajoutez plus de détails"
            rows={2}
          />

          {/* Quantité + Unité + Type */}
          <div className="grid grid-cols-2 gap-3">
            {/* Quantité + Unité (inline) */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Quantité</Label>
              <div className="flex gap-1">
                <RhfInput<DevisEditFormType>
                  name={`lignes.${index}.quantite` as Path<DevisEditFormType>}
                  type="number"
                  min="0"
                  step="0.001"
                  inputClassName="w-20 shrink-0"
                />
                <RhfComboboxInput<DevisEditFormType>
                  name={`lignes.${index}.unite` as Path<DevisEditFormType>}
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
                <RhfControlledSelect<DevisEditFormType>
                  name={`lignes.${index}.typePrix` as never}
                  selectClassName="w-full"
                  className="min-w-0 flex-1"
                  onChange={(v) => {
                    if (v !== "abonnement") {
                      setValue(
                        `lignes.${index}.periodeFacturation` as Path<DevisEditFormType>,
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
                  <RhfControlledSelect<DevisEditFormType>
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
            <div className="flex flex-col gap-2">
              <Label className="text-sm">
                Prix unitaire (HT{periodeLabel})
              </Label>
              <div className="relative">
                <span className="text-muted-foreground absolute top-[18px] left-3 -translate-y-1/2 text-xs">
                  EUR
                </span>
                <RhfInput<DevisEditFormType>
                  name={
                    `lignes.${index}.prixUnitaireHtEur` as Path<DevisEditFormType>
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  inputClassName="pl-10"
                  placeholder="0,00"
                />
              </div>
            </div>
            <RhfControlledSelect<DevisEditFormType>
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
                  `lignes.${index}.hasRemise` as Path<DevisEditFormType>,
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
                      `lignes.${index}.hasRemise` as Path<DevisEditFormType>,
                      false as never,
                    );
                    setValue(
                      `lignes.${index}.remiseHtMontantEur` as Path<DevisEditFormType>,
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
                <RhfInput<DevisEditFormType>
                  name={
                    `lignes.${index}.remiseHtMontantEur` as Path<DevisEditFormType>
                  }
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

// ============================= READ ONLY VIEW ==============================//

type ReadOnlyDevisViewTypeProps = {
  devis: DevisAvecLignes;
  permissions: PermissionsType;
};

function ReadOnlyDevisViewType({
  devis,
  permissions,
}: ReadOnlyDevisViewTypeProps) {
  const fmt = (c: number) =>
    (c / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  // Calcul des totaux
  const totalHtBrut = devis.lignes.reduce(
    (sum, l) => sum + l.prixUnitaireHt * Number(l.quantite),
    0,
  );
  const totalRemiseLignes = devis.lignes.reduce(
    (sum, l) => sum + (l.remiseHtMontant ?? 0),
    0,
  );
  const remiseGlobale = devis.remiseGlobaleHt ?? 0;
  const totalHtNet = totalHtBrut - totalRemiseLignes - remiseGlobale;
  const totalTva = devis.lignes.reduce((sum, l) => {
    const htNet =
      l.prixUnitaireHt * Number(l.quantite) - (l.remiseHtMontant ?? 0);
    return sum + Math.round((htNet * l.tauxTva) / 10000);
  }, 0);
  const totalTtc = totalHtNet + totalTva;

  const periodeLabel = (l: DevisAvecLignes["lignes"][number]) => {
    if (l.typePrix !== "abonnement" || !l.periodeFacturation) return "";
    return (
      { semaine: "/sem.", mois: "/mois", annee: "/an" }[l.periodeFacturation] ??
      ""
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Parties */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Parties
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Émetteur */}
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Émetteur
            </p>
            <p className="font-semibold">{devis.emetteurEntrepriseNom}</p>
            {devis.emetteurPrenomContact && (
              <p className="text-muted-foreground text-xs">
                {devis.emetteurPrenomContact} {devis.emetteurNomContact}
              </p>
            )}
            {devis.emetteurEmailContact && (
              <p className="text-muted-foreground text-xs">
                {devis.emetteurEmailContact}
              </p>
            )}
            {devis.emetteurPhoneContact && (
              <p className="text-muted-foreground text-xs">
                {devis.emetteurPhoneContact}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              SIRET&nbsp;: {devis.emetteurEntrepriseSiret}
            </p>
            {devis.emetteurEntrepriseNumeroTva && (
              <p className="text-muted-foreground text-xs">
                TVA&nbsp;: {devis.emetteurEntrepriseNumeroTva}
              </p>
            )}
          </div>
          {/* Client */}
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
              Client
            </p>
            <p className="font-semibold">{devis.proprietaireEntrepriseNom}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              SIRET&nbsp;: {devis.proprietaireEntrepriseSiret}
            </p>
            {devis.proprietaireEntrepriseNumeroTva && (
              <p className="text-muted-foreground text-xs">
                TVA&nbsp;: {devis.proprietaireEntrepriseNumeroTva}
              </p>
            )}
            <p className="text-muted-foreground mt-2 text-xs font-medium tracking-wide uppercase">
              Site
            </p>
            <p className="text-xs">{devis.siteNom}</p>
            <p className="text-muted-foreground text-xs">
              {devis.siteAdresse}, {devis.siteCodePostal} {devis.siteVille}
            </p>
          </div>
        </div>
      </section>

      {/* Dates */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Dates
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border p-3 text-sm">
          {devis.dateEmission && (
            <>
              <span className="text-muted-foreground">Émission</span>
              <span>
                {new Date(devis.dateEmission).toLocaleDateString("fr-FR")}
              </span>
            </>
          )}
          {devis.validTo && (
            <>
              <span className="text-muted-foreground">Expiration</span>
              <span>{new Date(devis.validTo).toLocaleDateString("fr-FR")}</span>
            </>
          )}
        </div>
      </section>

      {/* Lignes */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Produits & services ({devis.lignes.length})
        </h2>
        <div className="rounded-lg border">
          {devis.lignes.length === 0 ? (
            <p className="text-muted-foreground p-3 text-sm italic">
              Aucune ligne
            </p>
          ) : (
            <div className="divide-y">
              {devis.lignes.map((l) => {
                const ligneHt =
                  l.prixUnitaireHt * Number(l.quantite) -
                  (l.remiseHtMontant ?? 0);
                return (
                  <div key={l.id} className="px-3 py-2.5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{l.designation}</span>
                      <span className="text-muted-foreground shrink-0 font-mono text-xs">
                        {fmt(ligneHt)} HT
                      </span>
                    </div>
                    {l.description && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {l.description}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {Number(l.quantite)} {l.unite} × {fmt(l.prixUnitaireHt)}
                      {periodeLabel(l) && <span> {periodeLabel(l)}</span>}
                      {" — "}TVA {l.tauxTva / 100}&nbsp;%
                      {l.remiseHtMontant ? (
                        <span className="text-orange-500">
                          {" "}
                          — remise {fmt(l.remiseHtMontant)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Totaux */}
      <section>
        <div className="rounded-lg border p-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total HT brut</span>
              <span className="font-mono">{fmt(totalHtBrut)}</span>
            </div>
            {totalRemiseLignes > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remises lignes</span>
                <span className="font-mono text-orange-500">
                  − {fmt(totalRemiseLignes)}
                </span>
              </div>
            )}
            {remiseGlobale > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remise globale</span>
                <span className="font-mono text-orange-500">
                  − {fmt(remiseGlobale)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1">
              <span className="text-muted-foreground">Total HT net</span>
              <span className="font-mono font-medium">{fmt(totalHtNet)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span className="font-mono">{fmt(totalTva)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total TTC</span>
              <span className="font-mono">{fmt(totalTtc)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {devis.description && (
        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
            Description
          </h2>
          <p className="rounded-lg border p-3 text-sm whitespace-pre-wrap">
            {devis.description}
          </p>
        </section>
      )}

      {/* Note interne — visible seulement côté émetteur (pas canSigner = côté client) */}
      {devis.noteInterne && !permissions.canSigner && (
        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
            Note interne
          </h2>
          <p className="rounded-lg border border-dashed p-3 text-sm whitespace-pre-wrap italic">
            {devis.noteInterne}
          </p>
        </section>
      )}
    </div>
  );
}
