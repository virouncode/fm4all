"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { devisLigneUniteCT, devisTypePrixCT } from "@/constants/codeTables";
import { useRouter } from "@/i18n/navigation";
import {
  emettreDevisAction,
  refuserDevisAction,
  saveDevisWithLignesAction,
  signerDevisAction,
} from "@/server/actions/devisActions";
import type { DevisAvecLignes } from "@/server/queries/devis.query";
import type {
  DevisLigneUniteType,
  DevisTypePrixType,
} from "@/zod-schemas/enums";
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DevisPreviewData, DevisPreviewLigne } from "../DevisPreviewCard";
import { DevisPreviewCard } from "../DevisPreviewCard";
import { getDevisStatutBadge } from "../helpers";

// ============================= TYPES ==============================//

type LocalLigneType = {
  tempId: string;
  id?: string; // DB id si existant
  designation: string;
  description: string;
  quantite: string;
  unite: DevisLigneUniteType;
  prixUnitaireHtEur: string;
  tauxTva: number;
  hasRemise: boolean;
  remiseHtMontantEur: string;
  typePrix: DevisTypePrixType;
  isOpen: boolean;
};

type PermissionsType = {
  canEdit: boolean;
  canEmettre: boolean;
  canSigner: boolean;
  canRefuser: boolean;
  isReadOnly: boolean;
};

type Props = {
  devis: DevisAvecLignes;
  permissions: PermissionsType;
};

// ============================= CONSTANTES ==============================//

const TVA_OPTIONS = [
  { value: 2000, label: "20 %" },
  { value: 1000, label: "10 %" },
  { value: 550, label: "5,5 %" },
  { value: 0, label: "0 %" },
];

// ============================= HELPERS ==============================//

function eurToCentimes(eur: string): number {
  const v = parseFloat(eur.replace(",", ".") || "0");
  return isNaN(v) ? 0 : Math.round(v * 100);
}

function centimesToEurStr(c: number): string {
  return (c / 100).toFixed(2);
}

function calcTtc(prixHtEur: string, tauxTva: number): string {
  const ht = parseFloat(prixHtEur.replace(",", ".") || "0");
  if (isNaN(ht)) return "0,00";
  const ttc = ht * (1 + tauxTva / 10000);
  return ttc.toFixed(2).replace(".", ",");
}

function lignesFromDb(dbLignes: DevisAvecLignes["lignes"]): LocalLigneType[] {
  return dbLignes.map((l) => ({
    tempId: l.id,
    id: l.id,
    designation: l.designation,
    description: l.description ?? "",
    quantite: String(l.quantite),
    unite: l.unite as DevisLigneUniteType,
    prixUnitaireHtEur: centimesToEurStr(l.prixUnitaireHt),
    tauxTva: l.tauxTva,
    hasRemise: l.remiseHtMontant > 0,
    remiseHtMontantEur:
      l.remiseHtMontant > 0 ? centimesToEurStr(l.remiseHtMontant) : "",
    typePrix: l.typePrix as DevisTypePrixType,
    isOpen: false,
  }));
}

function newLigne(ordre: number): LocalLigneType {
  return {
    tempId: crypto.randomUUID(),
    designation: "",
    description: "",
    quantite: "1",
    unite: "unite",
    prixUnitaireHtEur: "",
    tauxTva: 2000,
    hasRemise: false,
    remiseHtMontantEur: "",
    typePrix: "one_shot",
    isOpen: true,
  };
}

function buildPreview(
  devis: DevisAvecLignes,
  lignes: LocalLigneType[],
  titre: string,
  description: string,
  remiseGlobaleHtEur: string,
  validToStr: string,
): DevisPreviewData {
  const previewLignes: DevisPreviewLigne[] = lignes.map((l) => ({
    id: l.tempId,
    designation: l.designation || "—",
    description: l.description || null,
    quantite: l.quantite || "0",
    unite: l.unite,
    prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur),
    tauxTva: l.tauxTva,
    remiseHtMontant: l.hasRemise ? eurToCentimes(l.remiseHtMontantEur) : 0,
  }));

  return {
    numero: devis.numero,
    titre: titre || devis.titre,
    description: description || null,
    statut: devis.statut,
    remiseGlobaleHt: eurToCentimes(remiseGlobaleHtEur),
    dateEmission: devis.dateEmission,
    validTo: validToStr ? new Date(validToStr) : devis.validTo,
    updatedAt: devis.updatedAt,
    emetteurEntrepriseNom: devis.emetteurEntrepriseNom,
    emetteurEntrepriseSiret: devis.emetteurEntrepriseSiret,
    emetteurEntrepriseNumeroTva: devis.emetteurEntrepriseNumeroTva,
    emetteurEmailContact: devis.emetteurEmailContact,
    emetteurPhoneContact: devis.emetteurPhoneContact,
    emetteurPrenomContact: devis.emetteurPrenomContact,
    emetteurNomContact: devis.emetteurNomContact,
    proprietaireEntrepriseNom: devis.proprietaireEntrepriseNom,
    proprietaireEntrepriseSiret: devis.proprietaireEntrepriseSiret,
    proprietaireEntrepriseNumeroTva: devis.proprietaireEntrepriseNumeroTva,
    siteNom: devis.siteNom,
    siteAdresse: devis.siteAdresse,
    siteCodePostal: devis.siteCodePostal,
    siteVille: devis.siteVille,
    lignes: previewLignes,
  };
}

// ============================= COMPOSANT PRINCIPAL ==============================//

export function DevisDetailClient({ devis: initialDevis, permissions }: Props) {
  const router = useRouter();
  const [devis, setDevis] = useState(initialDevis);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État éditeur (brouillon modifiable)
  const [lignes, setLignes] = useState<LocalLigneType[]>(() =>
    lignesFromDb(initialDevis.lignes),
  );
  const [titre, setTitre] = useState(initialDevis.titre);
  const [description, setDescription] = useState(
    initialDevis.description ?? "",
  );
  const [noteInterne, setNoteInterne] = useState(
    initialDevis.noteInterne ?? "",
  );
  const [remiseGlobaleHtEur, setRemiseGlobaleHtEur] = useState(
    initialDevis.remiseGlobaleHt > 0
      ? centimesToEurStr(initialDevis.remiseGlobaleHt)
      : "",
  );
  const [validToStr, setValidToStr] = useState(
    initialDevis.validTo
      ? new Date(initialDevis.validTo).toISOString().slice(0, 10)
      : "",
  );

  const badge = getDevisStatutBadge(devis.statut);

  const preview = buildPreview(
    devis,
    permissions.canEdit ? lignes : lignesFromDb(devis.lignes),
    permissions.canEdit ? titre : devis.titre,
    permissions.canEdit ? description : (devis.description ?? ""),
    permissions.canEdit
      ? remiseGlobaleHtEur
      : centimesToEurStr(devis.remiseGlobaleHt),
    permissions.canEdit
      ? validToStr
      : devis.validTo
        ? new Date(devis.validTo).toISOString().slice(0, 10)
        : "",
  );

  // ===== Transitions statut =====

  async function handleEmettre() {
    setIsSubmitting(true);
    try {
      const result = await emettreDevisAction({ devisId: devis.id });
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }
      if (result?.data?.devis) {
        setDevis((prev) => ({ ...prev, ...result.data!.devis }));
        toast.success(`Devis ${result.data.devis.numero} émis avec succès`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSigner() {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }

  async function handleRefuser() {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }

  // ===== Sauvegarde brouillon =====

  async function handleSave() {
    if (!titre.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    if (lignes.length === 0) {
      toast.error("Ajoutez au moins une ligne");
      return;
    }
    for (const l of lignes) {
      if (!l.designation.trim()) {
        toast.error("Chaque ligne doit avoir une désignation");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await saveDevisWithLignesAction({
        id: devis.id,
        proprietaireEntrepriseId: devis.proprietaireEntrepriseId,
        emetteurEntrepriseId: devis.emetteurEntrepriseId,
        demandeurEntrepriseId: devis.demandeurEntrepriseId,
        siteId: devis.siteId,
        titre: titre.trim(),
        description: description.trim() || undefined,
        noteInterne: noteInterne.trim() || undefined,
        remiseGlobaleHt: remiseGlobaleHtEur
          ? eurToCentimes(remiseGlobaleHtEur)
          : undefined,
        validTo: validToStr ? new Date(validToStr) : undefined,
        lignes: lignes.map((l, idx) => ({
          designation: l.designation.trim(),
          description: l.description.trim() || undefined,
          quantite: l.quantite || "1",
          unite: l.unite,
          prixUnitaireHt: eurToCentimes(l.prixUnitaireHtEur),
          tauxTva: l.tauxTva,
          remiseHtMontant: l.hasRemise
            ? eurToCentimes(l.remiseHtMontantEur)
            : 0,
          typePrix: l.typePrix,
          ordre: idx,
        })),
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      toast.success("Devis sauvegardé");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ===== Gestion lignes =====

  function updateLigne(tempId: string, patch: Partial<LocalLigneType>) {
    setLignes((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, ...patch } : l)),
    );
  }

  function removeLigne(tempId: string) {
    setLignes((prev) => prev.filter((l) => l.tempId !== tempId));
  }

  function addLigne() {
    setLignes((prev) => [...prev, newLigne(prev.length)]);
  }

  // ============================= RENDER ==============================//

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      {/* Barre d'actions */}
      <div className="flex flex-shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/app/devis")}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
          {devis.numero && (
            <span className="text-muted-foreground font-mono text-sm">
              {devis.numero}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {permissions.canEdit && (
            <Button
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleSave}
            >
              Sauvegarder
            </Button>
          )}
          {permissions.canEmettre && (
            <Button size="sm" disabled={isSubmitting} onClick={handleEmettre}>
              <Send className="h-4 w-4" />
              Émettre
            </Button>
          )}
          {permissions.canSigner && (
            <Button size="sm" disabled={isSubmitting} onClick={handleSigner}>
              <CheckCircle className="h-4 w-4" />
              Signer
            </Button>
          )}
          {permissions.canRefuser && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleRefuser}
            >
              <XCircle className="h-4 w-4" />
              Refuser
            </Button>
          )}
        </div>
      </div>

      {/* Split-screen */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Colonne gauche */}
        <div className="flex w-[380px] flex-shrink-0 flex-col gap-4 overflow-y-auto pr-1">
          {permissions.canEdit ? (
            // ===== MODE ÉDITEUR =====
            <>
              {/* Titre */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Titre du devis</Label>
                <Input
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Titre du devis"
                />
              </div>

              {/* Date validité */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Valide jusqu&apos;au
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "15 j", days: 15 },
                    { label: "30 j", days: 30 },
                    { label: "90 j", days: 90 },
                  ].map(({ label, days }) => (
                    <Button
                      key={days}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + days);
                        setValidToStr(d.toISOString().slice(0, 10));
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                  <Input
                    type="date"
                    className="h-7 w-36 text-xs"
                    value={validToStr}
                    onChange={(e) => setValidToStr(e.target.value)}
                  />
                </div>
              </div>

              {/* Lignes */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Lignes</p>
                {lignes.map((l, idx) => (
                  <LigneAccordion
                    key={l.tempId}
                    ligne={l}
                    index={idx}
                    onChange={(patch) => updateLigne(l.tempId, patch)}
                    onRemove={() => removeLigne(l.tempId)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addLigne}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>

              {/* Remise globale */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Remise globale HT (€)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={remiseGlobaleHtEur}
                  onChange={(e) => setRemiseGlobaleHtEur(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Description (visible client)
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Note interne */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Note interne (non visible client)
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Note interne…"
                  value={noteInterne}
                  onChange={(e) => setNoteInterne(e.target.value)}
                />
              </div>
            </>
          ) : (
            // ===== MODE LECTURE SEULE =====
            <>
              <div className="space-y-2 rounded-lg border p-4">
                <h2 className="text-sm font-semibold">Informations</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Émetteur</span>
                  <span className="font-medium">
                    {devis.emetteurEntrepriseNom}
                  </span>
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium">
                    {devis.proprietaireEntrepriseNom}
                  </span>
                  <span className="text-muted-foreground">Site</span>
                  <span>{devis.siteNom}</span>
                  {devis.validTo && (
                    <>
                      <span className="text-muted-foreground">
                        Valide jusqu&apos;au
                      </span>
                      <span>
                        {new Date(devis.validTo).toLocaleDateString("fr-FR")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border p-4">
                <h2 className="text-sm font-semibold">
                  Lignes ({devis.lignes.length})
                </h2>
                {devis.lignes.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    Aucune ligne
                  </p>
                ) : (
                  <div className="divide-y text-sm">
                    {devis.lignes.map((l) => (
                      <div key={l.id} className="py-2">
                        <div className="flex justify-between font-medium">
                          <span className="line-clamp-1">{l.designation}</span>
                          <span className="ml-2 shrink-0 font-mono">
                            {(
                              (l.prixUnitaireHt * Number(l.quantite)) /
                              100
                            ).toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}{" "}
                            HT
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {Number(l.quantite)} {l.unite} ×{" "}
                          {(l.prixUnitaireHt / 100).toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}{" "}
                          — TVA {l.tauxTva / 100}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {devis.noteInterne && !permissions.canSigner && (
                <div className="space-y-1 rounded-lg border border-dashed p-4">
                  <h2 className="text-muted-foreground text-sm font-semibold">
                    Note interne
                  </h2>
                  <p className="text-sm whitespace-pre-wrap">
                    {devis.noteInterne}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Colonne droite : preview A4 */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-900">
          <DevisPreviewCard devis={preview} />
        </div>
      </div>
    </div>
  );
}

// ============================= LIGNE ACCORDION ==============================//

type LigneAccordionProps = {
  ligne: LocalLigneType;
  index: number;
  onChange: (patch: Partial<LocalLigneType>) => void;
  onRemove: () => void;
};

function LigneAccordion({
  ligne,
  index,
  onChange,
  onRemove,
}: LigneAccordionProps) {
  const ttc = calcTtc(ligne.prixUnitaireHtEur, ligne.tauxTva);

  return (
    <div className="bg-card rounded-lg border">
      {/* Header de l'accordéon */}
      <div
        className="flex cursor-pointer items-center justify-between px-3 py-2"
        onClick={() => onChange({ isOpen: !ligne.isOpen })}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {ligne.designation || `Ligne ${index + 1}`}
          </p>
          {!ligne.isOpen && (
            <p className="text-muted-foreground text-xs">
              {ligne.quantite} {ligne.unite} ·{" "}
              {ligne.prixUnitaireHtEur
                ? `${parseFloat(ligne.prixUnitaireHtEur).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} HT`
                : "—"}
            </p>
          )}
        </div>
        <div className="ml-2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {ligne.isOpen ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </div>
      </div>

      {/* Contenu développé */}
      {ligne.isOpen && (
        <div className="space-y-3 border-t px-3 py-3">
          {/* Désignation */}
          <div className="space-y-1">
            <Label className="text-xs">Désignation *</Label>
            <Input
              value={ligne.designation}
              onChange={(e) => onChange({ designation: e.target.value })}
              placeholder="Désignation de la prestation"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Description</Label>
            <Textarea
              rows={2}
              value={ligne.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Détails optionnels…"
            />
          </div>

          {/* Quantité + Unité */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Quantité *</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={ligne.quantite}
                onChange={(e) => onChange({ quantite: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Unité *</Label>
              <Select
                value={ligne.unite}
                onValueChange={(v) =>
                  onChange({ unite: v as DevisLigneUniteType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {devisLigneUniteCT.map((u) => (
                    <SelectItem key={u.code} value={u.code}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type prix */}
          <div className="space-y-1">
            <Label className="text-xs">Type de prix *</Label>
            <Select
              value={ligne.typePrix}
              onValueChange={(v) =>
                onChange({ typePrix: v as DevisTypePrixType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {devisTypePrixCT.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PU HT + TVA + PU TTC */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">PU HT (€) *</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={ligne.prixUnitaireHtEur}
                onChange={(e) =>
                  onChange({ prixUnitaireHtEur: e.target.value })
                }
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">TVA *</Label>
              <Select
                value={String(ligne.tauxTva)}
                onValueChange={(v) => onChange({ tauxTva: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TVA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">PU TTC</Label>
              <Input
                value={ttc}
                readOnly
                className="bg-muted text-muted-foreground cursor-default"
              />
            </div>
          </div>

          {/* Remise ligne */}
          <div className="space-y-1">
            <Label className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={ligne.hasRemise}
                onChange={(e) => onChange({ hasRemise: e.target.checked })}
              />
              Remise sur cette ligne
            </Label>
            {ligne.hasRemise && (
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Montant remise HT (€)"
                value={ligne.remiseHtMontantEur}
                onChange={(e) =>
                  onChange({ remiseHtMontantEur: e.target.value })
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
