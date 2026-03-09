"use client";

import type { DevisStatutType } from "@/zod-schemas/enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ============================= TYPES ==============================//

export type DevisPreviewLigne = {
  id?: string;
  designation: string;
  description?: string | null;
  quantite: string | number;
  unite: string;
  prixUnitaireHt: number; // centimes
  tauxTva: number; // x100 (ex: 2000 = 20%)
  remiseHtMontant: number; // centimes
  typePrix?: string | null;
  periodeFacturation?: string | null;
};

export type DevisPreviewData = {
  numero?: string | null;
  titre: string;
  description?: string | null;
  statut: DevisStatutType;
  remiseGlobaleHt: number; // centimes
  dateEmission?: Date | string | null;
  validTo?: Date | string | null;
  updatedAt?: Date | string | null;
  // Émetteur
  emetteurEntrepriseNom: string;
  emetteurEntrepriseSiret: string;
  emetteurEntrepriseNumeroTva?: string | null;
  emetteurEmailContact?: string | null;
  emetteurPhoneContact?: string | null;
  emetteurPrenomContact?: string | null;
  emetteurNomContact?: string | null;
  emetteurLogoUrl?: string | null;
  // Propriétaire (client)
  proprietaireEntrepriseNom: string;
  proprietaireEntrepriseSiret: string;
  proprietaireEntrepriseNumeroTva?: string | null;
  // Site
  siteNom: string;
  siteAdresse: string; // adresseLigne1
  siteCodePostal?: string | null;
  siteVille?: string | null;
  siteContactPrenom?: string | null;
  siteContactNom?: string | null;
  siteContactEmail?: string | null;
  siteContactPhone?: string | null;
  lignes: DevisPreviewLigne[];
};

// ============================= HELPERS ==============================//

function formatEur(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(centimes / 100);
}

function formatQty(v: string | number): string {
  return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 3 });
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy", { locale: fr });
}

function periodeSuffix(
  typePrix?: string | null,
  periodeFacturation?: string | null,
): string {
  if (typePrix === "abonnement") {
    const map: Record<string, string> = {
      semaine: "/sem.",
      mois: "/mois",
      annee: "/an",
    };
    return periodeFacturation ? (map[periodeFacturation] ?? "") : "";
  }
  if (typePrix === "installation") return " (install.)";
  if (typePrix === "frais_livraison") return " (livraison)";
  return "";
}

// ============================= COMPOSANT ==============================//

type Props = {
  devis: DevisPreviewData;
  pdfMode?: boolean;
};

export function DevisPreviewCard({ devis, pdfMode = false }: Props) {
  const lignes = devis.lignes;

  type TotauxTvaType = { base: number; tva: number };
  const totauxParTaux: Record<number, TotauxTvaType> = {};

  let totalHtBrut = 0;
  let totalRemiseLignes = 0;

  for (const l of lignes) {
    const qte = Number(l.quantite);
    const montantHt = l.prixUnitaireHt * qte;
    const remise = l.remiseHtMontant;
    const montantHtNet = montantHt - remise;
    const tva = Math.round((montantHtNet * l.tauxTva) / 10000);

    totalHtBrut += montantHt;
    totalRemiseLignes += remise;

    if (!totauxParTaux[l.tauxTva])
      totauxParTaux[l.tauxTva] = { base: 0, tva: 0 };
    totauxParTaux[l.tauxTva].base += montantHtNet;
    totauxParTaux[l.tauxTva].tva += tva;
  }

  const totalHtNet = totalHtBrut - totalRemiseLignes - devis.remiseGlobaleHt;
  const totalTva = Object.values(totauxParTaux).reduce((s, t) => s + t.tva, 0);
  const totalTtc = totalHtNet + totalTva;

  const siteAdresseComplete = [
    devis.siteAdresse,
    [devis.siteCodePostal, devis.siteVille].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="flex flex-col bg-white font-sans text-gray-900 shadow-2xl"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontSize: "9pt",
        lineHeight: pdfMode ? "1.2" : "1.5",
      }}
    >
      {/* ═══ EN-TÊTE ═══ */}
      <div className="flex items-start justify-between px-10 pt-8 pb-4">
        {/* Titre + infos */}
        <div>
          <p
            className="text-primary font-bold tracking-widest uppercase"
            style={{ fontSize: "22pt" }}
          >
            Devis
          </p>

          <div className="mt-3 space-y-0.5">
            {devis.numero ? (
              <div className="flex items-center gap-2">
                <span className="w-28 text-xs text-gray-500">Numéro</span>
                <span className="font-mono text-xs font-semibold">
                  {devis.numero}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-28 text-xs text-gray-500">Numéro</span>
                <span className="text-xs text-gray-400 italic">
                  Brouillon — attribué à l&apos;émission
                </span>
              </div>
            )}
            {devis.dateEmission && (
              <div className="flex items-center gap-2">
                <span className="w-28 text-xs text-gray-500">
                  Date d&apos;émission
                </span>
                <span className="text-xs font-medium">
                  {formatDate(devis.dateEmission)}
                </span>
              </div>
            )}
            {devis.validTo && (
              <div className="flex items-center gap-2">
                <span className="w-28 text-xs text-gray-500">
                  Date d&apos;expiration
                </span>
                <span className="text-xs font-medium">
                  {formatDate(devis.validTo)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Logo ou initiales */}
        <div className="flex flex-col items-end gap-2">
          {devis.emetteurLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={devis.emetteurLogoUrl}
              alt={devis.emetteurEntrepriseNom}
              className="max-h-12 max-w-40 object-contain"
            />
          ) : (
            <div
              className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded font-bold"
              style={{ fontSize: "18pt" }}
            >
              {devis.emetteurEntrepriseNom.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ═══ ÉMETTEUR + DESTINATAIRE ═══ */}
      <div className={`grid grid-cols-2 gap-0 px-10 ${pdfMode ? "py-2" : "py-3"}`}>
        {/* Émetteur */}
        <div className={`border-r border-gray-200 pr-6 ${pdfMode ? "[&_p]:!leading-snug [&_p]:!mb-0.5" : ""}`}>
          <div className={`text-primary text-xs font-semibold tracking-wider uppercase ${pdfMode ? "mb-4" : "mb-2"}`}>
            De
          </div>
          <div className={`text-sm font-bold ${pdfMode ? "mb-2" : ""}`}>{devis.emetteurEntrepriseNom}</div>
          <div className={pdfMode ? "" : "mt-1 space-y-0.5"}>
            {(devis.emetteurPrenomContact || devis.emetteurNomContact) && (
              <p className="text-xs text-gray-600">
                {[devis.emetteurPrenomContact, devis.emetteurNomContact]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}
            {devis.emetteurEmailContact && (
              <p className="text-xs text-gray-600">
                {devis.emetteurEmailContact}
              </p>
            )}
            {devis.emetteurPhoneContact && (
              <p className="text-xs text-gray-600">
                {devis.emetteurPhoneContact}
              </p>
            )}
            <p className="text-xs text-gray-500">
              SIRET : {devis.emetteurEntrepriseSiret}
            </p>
            {devis.emetteurEntrepriseNumeroTva && (
              <p className="text-xs text-gray-500">
                N° TVA : {devis.emetteurEntrepriseNumeroTva}
              </p>
            )}
          </div>
        </div>

        {/* Destinataire */}
        <div className={`pl-6 ${pdfMode ? "[&_p]:!leading-snug [&_p]:!mb-0.5" : ""}`}>
          <div className={`text-primary text-xs font-semibold tracking-wider uppercase ${pdfMode ? "mb-4" : "mb-2"}`}>
            À
          </div>
          <div className={`text-sm font-bold ${pdfMode ? "mb-2" : ""}`}>
            {devis.proprietaireEntrepriseNom || "—"}
          </div>
          <div className={pdfMode ? "" : "mt-1 space-y-0.5"}>
            {devis.proprietaireEntrepriseSiret && (
              <p className="text-xs text-gray-500">
                SIRET : {devis.proprietaireEntrepriseSiret}
              </p>
            )}
            {devis.proprietaireEntrepriseNumeroTva && (
              <p className="text-xs text-gray-500">
                N° TVA : {devis.proprietaireEntrepriseNumeroTva}
              </p>
            )}
            {/* Site d'intervention */}
            {devis.siteNom && (
              <div className={pdfMode ? "mt-3 border-t border-gray-100 pt-3" : "mt-2 border-t border-gray-100 pt-2"}>
                <p className="text-xs tracking-wide text-gray-400 uppercase">
                  Site d&apos;intervention
                </p>
                <p className="text-xs font-medium text-gray-700">
                  {devis.siteNom}
                </p>
                {siteAdresseComplete && (
                  <p className="text-xs text-gray-500">{siteAdresseComplete}</p>
                )}
                {(devis.siteContactPrenom || devis.siteContactNom) && (
                  <p className="text-xs text-gray-600">
                    {[devis.siteContactPrenom, devis.siteContactNom]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                )}
                {devis.siteContactEmail && (
                  <p className="text-xs text-gray-500">
                    {devis.siteContactEmail}
                  </p>
                )}
                {devis.siteContactPhone && (
                  <p className="text-xs text-gray-500">
                    {devis.siteContactPhone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DESCRIPTION ═══ */}
      {devis.description && (
        <div className="mx-10 mb-4 px-1">
          <p className="text-xs whitespace-pre-wrap text-gray-600">
            {devis.description}
          </p>
        </div>
      )}

      {/* ═══ TABLEAU DES LIGNES ═══ */}
      <div className="px-10">
        <table className="w-full border-collapse" style={{ fontSize: "8pt" }}>
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th
                className="px-3 py-2 font-semibold"
                style={{ width: "42%", textAlign: "left" }}
              >
                Description
              </th>
              <th
                className="px-2 py-2 font-semibold"
                style={{ width: "10%", textAlign: "center" }}
              >
                Qté
              </th>
              <th
                className="px-2 py-2 font-semibold"
                style={{ width: "18%", textAlign: "right" }}
              >
                Prix unitaire
              </th>
              <th
                className="px-2 py-2 font-semibold"
                style={{ width: "10%", textAlign: "center" }}
              >
                TVA (%)
              </th>
              <th
                className="px-3 py-2 font-semibold"
                style={{ width: "20%", textAlign: "right" }}
              >
                Total HT
              </th>
            </tr>
          </thead>
          <tbody>
            {lignes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-xs text-gray-400 italic"
                >
                  Aucune ligne
                </td>
              </tr>
            ) : (
              lignes.map((l, idx) => {
                const qte = Number(l.quantite);
                const montantHt = l.prixUnitaireHt * qte;
                const net = montantHt - l.remiseHtMontant;
                return (
                  <tr
                    key={l.id ?? idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border-b border-gray-100 px-3 py-2" style={{ textAlign: "left" }}>
                      <p className="font-medium">{l.designation}</p>
                      {l.description && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {l.description}
                        </p>
                      )}
                    </td>
                    <td className="border-b border-gray-100 px-2 py-2" style={{ textAlign: "center" }}>
                      {formatQty(l.quantite)}{" "}
                      <span className="text-xs text-gray-400">{l.unite}</span>
                    </td>
                    <td className="border-b border-gray-100 px-2 py-2" style={{ textAlign: "right" }}>
                      {l.prixUnitaireHt > 0 ? (
                        <span>
                          {formatEur(l.prixUnitaireHt)}
                          {periodeSuffix(l.typePrix, l.periodeFacturation) && (
                            <span className="ml-0.5 text-gray-400">
                              {periodeSuffix(l.typePrix, l.periodeFacturation)}
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="border-b border-gray-100 px-2 py-2 text-gray-600" style={{ textAlign: "center" }}>
                      {l.tauxTva / 100} %
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 font-medium" style={{ textAlign: "right" }}>
                      {l.remiseHtMontant > 0 ? (
                        <span>
                          <span className="mr-1 text-xs text-gray-400 line-through">
                            {formatEur(montantHt)}
                          </span>
                          {formatEur(net)}
                        </span>
                      ) : (
                        formatEur(net)
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ═══ TOTAUX ═══ */}
      <div className="mt-4 mb-8 flex justify-end px-10">
        <div style={{ width: "60mm" }}>
          {/* HT brut */}
          <div className="flex justify-between border-b border-gray-300 py-1 text-xs">
            <span className="text-gray-500">Total HT</span>
            <span className="font-medium">{formatEur(totalHtBrut)}</span>
          </div>

          {/* Remises */}
          {totalRemiseLignes > 0 && (
            <div className="flex justify-between border-b border-gray-100 py-1 text-xs text-red-600">
              <span>Remises lignes</span>
              <span>−{formatEur(totalRemiseLignes)}</span>
            </div>
          )}
          {devis.remiseGlobaleHt > 0 && (
            <div className="flex justify-between border-b border-gray-100 py-1 text-xs text-red-600">
              <span>Remise globale</span>
              <span>−{formatEur(devis.remiseGlobaleHt)}</span>
            </div>
          )}

          {/* HT net (seulement si remises) */}
          {(totalRemiseLignes > 0 || devis.remiseGlobaleHt > 0) && (
            <div className="flex justify-between border-b border-gray-100 py-1 text-xs font-semibold">
              <span>Total HT net</span>
              <span>{formatEur(totalHtNet)}</span>
            </div>
          )}

          {/* Montant TVA total */}
          <div className="flex justify-between border-b border-gray-100 py-1 text-xs text-gray-600">
            <span>Montant TVA</span>
            <span>{formatEur(totalTva)}</span>
          </div>

          {/* TOTAL TTC */}
          <div className="bg-primary text-primary-foreground mt-1 flex justify-between rounded px-2 py-2 text-sm font-bold">
            <span>TOTAL TTC</span>
            <span>{formatEur(totalTtc)}</span>
          </div>
        </div>
      </div>

      {/* ═══ TAMPON STATUT ═══ */}
      {devis.statut === "signe" && (
        <div className="mx-10 mb-6 rounded border-2 border-green-500 py-3 text-center">
          <p className="text-sm font-bold tracking-widest text-green-700 uppercase">
            Devis accepté
          </p>
        </div>
      )}
      {devis.statut === "refuse" && (
        <div className="mx-10 mb-6 rounded border-2 border-red-400 py-3 text-center">
          <p className="text-sm font-bold tracking-widest text-red-600 uppercase">
            Devis refusé
          </p>
        </div>
      )}

      {/* ═══ PIED DE PAGE ═══ */}
      <div className={`border-primary/20 bg-primary/[0.06] mt-auto border-t-2 px-10 text-center text-xs text-gray-500 ${pdfMode ? "py-2 [&_p]:!leading-snug [&_p]:!mb-0.5" : "py-4"}`}>
        <p className="font-medium">{devis.emetteurEntrepriseNom}</p>
        <p>SIRET {devis.emetteurEntrepriseSiret}</p>
        {devis.emetteurEntrepriseNumeroTva && (
          <p>N° TVA : {devis.emetteurEntrepriseNumeroTva}</p>
        )}
      </div>
    </div>
  );
}
