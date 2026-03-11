"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useRouter } from "@/i18n/navigation";
import { getPresignedReadUrl, uploadFileToS3 } from "@/lib/s3/upload-helper";
import type { FactureAvecLignes } from "@/server/queries/factures.query";
import {
  annulerFactureAction,
  emettreFactureAction,
  saveFacturePdfAction,
} from "@/server/actions/facturesActions";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Printer,
  Send,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FacturePreviewData } from "../FacturePreviewCard";
import { FacturePreviewCard } from "../FacturePreviewCard";
import { formatFactureDate, formatMontantTtc, getFactureStatutBadge } from "../helpers";

type FacturePermissionsType = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canEmettre: boolean;
  canAnnuler: boolean;
};

type FactureDetailClientProps = {
  facture: FactureAvecLignes;
  permissions: FacturePermissionsType;
};

function formatQuantite(quantite: string): string {
  const num = parseFloat(quantite);
  return isNaN(num) ? quantite : num.toString();
}

function calculLigneTotalHt(
  quantite: string,
  prixUnitaireHt: number,
  remiseHtMontant: number | null,
): number {
  const qty = parseFloat(quantite) || 0;
  const total = qty * prixUnitaireHt;
  return Math.max(0, total - (remiseHtMontant ?? 0));
}

function buildPreview(
  facture: FactureAvecLignes,
  emetteurLogoUrl: string | null,
): FacturePreviewData {
  return {
    numero: facture.numero,
    titre: facture.titre,
    description: facture.description,
    notesClient: facture.notesClient,
    statut: facture.statut,
    remiseGlobaleHt: facture.remiseGlobaleHt ?? 0,
    dateEmission: facture.dateEmission,
    dateEcheance: facture.dateEcheance,
    periodeDebut: facture.periodeDebut,
    periodeFin: facture.periodeFin,
    emetteurEntrepriseNom: facture.emetteurEntrepriseNom,
    emetteurEntrepriseSiret: facture.emetteurEntrepriseSiret,
    emetteurEntrepriseNumeroTva: facture.emetteurEntrepriseNumeroTva,
    emetteurEmailContact: facture.emetteurEmailContact,
    emetteurPhoneContact: facture.emetteurPhoneContact,
    emetteurPrenomContact: facture.emetteurPrenomContact,
    emetteurNomContact: facture.emetteurNomContact,
    emetteurLogoUrl,
    destinataireEntrepriseNom: facture.destinataireEntrepriseNom,
    destinataireEntrepriseSiret: facture.destinataireEntrepriseSiret,
    destinataireEntrepriseNumeroTva: facture.destinataireEntrepriseNumeroTva,
    siteNom: facture.siteNom,
    siteAdresseLigne1: facture.siteAdresse,
    siteCodePostal: facture.siteCodePostal,
    siteVille: facture.siteVille,
    lignes: facture.lignes.map((l) => ({
      designation: l.designation,
      description: l.description,
      quantite: l.quantite,
      unite: l.unite,
      prixUnitaireHt: l.prixUnitaireHt,
      tauxTva: l.tauxTva,
      remiseHtMontant: l.remiseHtMontant ?? 0,
    })),
  };
}

export function FactureDetailClient({
  facture: initialFacture,
  permissions,
}: FactureDetailClientProps) {
  const router = useRouter();
  const [facture, setFacture] = useState(initialFacture);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfStorageKey, setPdfStorageKey] = useState<string | null>(
    initialFacture.pdfStorageKey ?? null,
  );
  const [emetteurLogoUrl, setEmetteurLogoUrl] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Charger le logo de l'émetteur en data URL (pour html2canvas — CORS)
  useEffect(() => {
    if (!initialFacture.emetteurLogoStorageKey) return;
    getPresignedReadUrl({
      key: initialFacture.emetteurLogoStorageKey,
      proprietaireEntrepriseId: initialFacture.emetteurEntrepriseId,
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
  }, [initialFacture.emetteurLogoStorageKey, initialFacture.emetteurEntrepriseId]);

  const badge = getFactureStatutBadge(facture.statut);
  const preview = buildPreview(facture, emetteurLogoUrl);

  const totalHt = facture.lignes.reduce((acc, ligne) => {
    return acc + calculLigneTotalHt(ligne.quantite, ligne.prixUnitaireHt, ligne.remiseHtMontant);
  }, 0) - (facture.remiseGlobaleHt ?? 0);

  // ─── PDF ──────────────────────────────────────────────────────────

  async function handleGenerateAndSavePdf(factureNumero: string) {
    if (!pdfRef.current) return;
    setIsPdfGenerating(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { PDFDocument } = await import("pdf-lib");

      // Convertir le logo en data URL pour éviter les problèmes CORS avec html2canvas
      if (emetteurLogoUrl) {
        const imgEl = pdfRef.current.querySelector("img") as HTMLImageElement | null;
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
              imgEl.onerror = () => resolve();
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
      const contentHeightPt = Math.round((canvas.height / canvas.width) * pageWidth);
      const drawY = pageHeight - Math.min(contentHeightPt, pageHeight);
      page.drawImage(pngImage, {
        x: 0,
        y: drawY,
        width: pageWidth,
        height: Math.min(contentHeightPt, pageHeight),
      });

      const pdfBytes = await pdfDoc.save();
      const filename = `facture-${factureNumero}.pdf`;
      const file = new File([pdfBytes.buffer as ArrayBuffer], filename, { type: "application/pdf" });

      const { key: tempKey } = await uploadFileToS3({
        file,
        proprietaireEntrepriseId: facture.emetteurEntrepriseId,
        categorie: "facture",
      });

      const saveResult = await saveFacturePdfAction({
        factureId: facture.id,
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
        proprietaireEntrepriseId: facture.emetteurEntrepriseId,
      });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `facture-${facture.numero ?? facture.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement du PDF");
    }
  }

  // ─── Transitions statut ───────────────────────────────────────────

  const handleEmettre = async () => {
    setIsSubmitting(true);
    try {
      const result = await emettreFactureAction({ factureId: facture.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.facture) {
        setFacture((prev) => ({ ...prev, ...result.data!.facture }));
        const numero = result.data.facture.numero ?? facture.id;
        toast.success(`Facture ${numero} émise avec succès`);
        // Générer et enregistrer le PDF après émission
        await handleGenerateAndSavePdf(numero);
      }
    } catch {
      toast.error("Erreur lors de l'émission de la facture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnuler = async () => {
    setIsSubmitting(true);
    try {
      const result = await annulerFactureAction({ factureId: facture.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      toast.success("Facture annulée");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'annulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isPdfGenerating;

  return (
    <div className="container mx-auto flex h-full flex-col overflow-auto px-6 py-4">
      {/* Header */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/factures">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            {facture.numero && (
              <span className="text-muted-foreground font-mono text-sm">
                Facture n° {facture.numero}
              </span>
            )}
            <h1 className="text-2xl font-bold">{facture.titre}</h1>
          </div>
          <Badge className={`text-sm ${badge.className}`}>{badge.label}</Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {permissions.canEdit && facture.statut === "brouillon" && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/app/factures/nouveau",
                  query: { editId: facture.id },
                }}
              >
                <FileText className="h-4 w-4" />
                Modifier
              </Link>
            </Button>
          )}

          {permissions.canEmettre && (
            <Button onClick={handleEmettre} disabled={disabled}>
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
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                title="Imprimer la facture"
                onClick={async () => {
                  const url = await getPresignedReadUrl({
                    key: pdfStorageKey,
                    proprietaireEntrepriseId: facture.emetteurEntrepriseId,
                  });
                  window.open(url, "_blank");
                }}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </>
          )}

          {permissions.canAnnuler && (
            <Button variant="destructive" onClick={handleAnnuler} disabled={disabled}>
              <XCircle className="h-4 w-4" />
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Bannière statut */}
      {facture.statut === "annulee" && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
          Cette facture a été annulée
        </div>
      )}

      {facture.statut === "litige" && (
        <div className="mb-4 rounded-md bg-orange-50 p-4 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
          Cette facture est en litige
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Émetteur
                  </p>
                  <p className="font-semibold">{facture.emetteurEntrepriseNom}</p>
                  <p className="text-muted-foreground text-sm">SIRET : {facture.emetteurEntrepriseSiret}</p>
                  {facture.emetteurEntrepriseNumeroTva && (
                    <p className="text-muted-foreground text-sm">TVA : {facture.emetteurEntrepriseNumeroTva}</p>
                  )}
                  {(facture.emetteurPrenomContact || facture.emetteurNomContact) && (
                    <p className="text-muted-foreground text-sm">
                      Contact : {[facture.emetteurPrenomContact, facture.emetteurNomContact].filter(Boolean).join(" ")}
                    </p>
                  )}
                  {facture.emetteurEmailContact && (
                    <p className="text-muted-foreground text-sm">{facture.emetteurEmailContact}</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Destinataire
                  </p>
                  <p className="font-semibold">{facture.destinataireEntrepriseNom}</p>
                  <p className="text-muted-foreground text-sm">SIRET : {facture.destinataireEntrepriseSiret}</p>
                  {facture.destinataireEntrepriseNumeroTva && (
                    <p className="text-muted-foreground text-sm">TVA : {facture.destinataireEntrepriseNumeroTva}</p>
                  )}
                  {facture.siteNom && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Site : {facture.siteNom}
                      {facture.siteAdresse && ` — ${facture.siteAdresse}`}
                      {facture.siteCodePostal && ` ${facture.siteCodePostal}`}
                      {facture.siteVille && ` ${facture.siteVille}`}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lignes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lignes de facturation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {facture.lignes.length === 0 ? (
                <p className="text-muted-foreground p-4 text-sm italic">
                  Aucune ligne de facturation
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Désignation</TableHead>
                      <TableHead className="w-20 text-right">Qté</TableHead>
                      <TableHead className="w-20">Unité</TableHead>
                      <TableHead className="w-28 text-right">Prix HT</TableHead>
                      <TableHead className="w-16 text-right">TVA</TableHead>
                      <TableHead className="w-28 text-right">Total HT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facture.lignes.map((ligne) => {
                      const totalHtLigne = calculLigneTotalHt(
                        ligne.quantite,
                        ligne.prixUnitaireHt,
                        ligne.remiseHtMontant,
                      );
                      return (
                        <TableRow key={ligne.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ligne.designation}</p>
                              {ligne.description && (
                                <p className="text-muted-foreground text-xs">
                                  {ligne.description}
                                </p>
                              )}
                              {ligne.remiseHtMontant != null && ligne.remiseHtMontant > 0 && (
                                <p className="text-xs text-orange-600">
                                  Remise : -{formatMontantTtc(ligne.remiseHtMontant)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatQuantite(ligne.quantite)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {ligne.unite}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMontantTtc(ligne.prixUnitaireHt)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {(ligne.tauxTva / 100).toFixed(0)} %
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMontantTtc(totalHtLigne)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(facture.description || facture.notesClient || facture.noteInterne) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {facture.description && (
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Description</p>
                    <p className="text-sm">{facture.description}</p>
                  </div>
                )}
                {facture.notesClient && (
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase">Notes client</p>
                    <p className="text-sm">{facture.notesClient}</p>
                  </div>
                )}
                {facture.noteInterne && (
                  <div>
                    <p className="text-xs font-medium uppercase text-amber-600">Note interne</p>
                    <p className="text-sm italic text-amber-700 dark:text-amber-400">{facture.noteInterne}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          {/* Totaux */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Totaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formatMontantTtc(totalHt)}</span>
              </div>
              {(facture.remiseGlobaleHt ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Remise globale HT</span>
                  <span>-{formatMontantTtc(facture.remiseGlobaleHt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatMontantTtc(facture.montantTva)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total TTC</span>
                <span>{formatMontantTtc(facture.montantTtc)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Infos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {facture.dateEmission && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date d'émission</span>
                  <span>{formatFactureDate(facture.dateEmission)}</span>
                </div>
              )}
              {facture.dateEcheance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Échéance</span>
                  <span>{formatFactureDate(facture.dateEcheance)}</span>
                </div>
              )}
              {facture.periodeDebut && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Période début</span>
                  <span>{facture.periodeDebut}</span>
                </div>
              )}
              {facture.periodeFin && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Période fin</span>
                  <span>{facture.periodeFin}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>{formatFactureDate(facture.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span>{formatFactureDate(facture.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Preview pleine taille hors-écran pour génération PDF ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}
      >
        <div ref={pdfRef}>
          <FacturePreviewCard facture={preview} pdfMode />
        </div>
      </div>
    </div>
  );
}
