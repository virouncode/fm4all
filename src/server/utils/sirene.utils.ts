import "server-only";
import { env } from "@/lib/env";
import { getFormeJuridiqueLabel } from "@/lib/utils/formesJuridiques";

export type SireneDataType = {
  nom: string;
  formeJuridique: string | null;
  adresseLigne1: string;
  adresseLigne2: string | null;
  codePostal: string;
  ville: string;
  numeroTva: string;
  etatActif: boolean;
};

function computeNumeroTva(siren: string): string {
  const sirenNum = parseInt(siren, 10);
  const cle = ((12 + 3 * (sirenNum % 97)) % 97).toString().padStart(2, "0");
  return `FR${cle}${siren}`;
}

function buildAdresseLigne1(etab: {
  numeroVoieEtablissement?: string | null;
  indiceRepetitionEtablissement?: string | null;
  typeVoieEtablissement?: string | null;
  libelleVoieEtablissement?: string | null;
}): string {
  return [
    etab.numeroVoieEtablissement,
    etab.indiceRepetitionEtablissement,
    etab.typeVoieEtablissement,
    etab.libelleVoieEtablissement,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export async function fetchEntrepriseBySiret(
  siret: string,
): Promise<SireneDataType | null> {
  // Token absent → SIRENE indisponible (retourne null, traité comme sireneUnavailable)
  if (!env.INSEE_API_TOKEN) return null;

  const cleanSiret = siret.replace(/\s/g, "");

  let response: Response;
  try {
    response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${cleanSiret}`,
      {
        headers: {
          "X-INSEE-Api-Key-Integration": env.INSEE_API_TOKEN,
          Accept: "application/json",
        },
        // Timeout 5s pour ne pas bloquer l'UI trop longtemps
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    // Réseau indisponible ou timeout
    return null;
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(
      `[SIRENE] Erreur HTTP ${response.status} pour SIRET ${cleanSiret}`,
    );
    return null;
  }

  let data: Record<string, unknown>;
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }

  const etab = data.etablissement as Record<string, unknown> | undefined;
  if (!etab) return null;

  const uniteLegale = etab.uniteLegale as Record<string, unknown> | undefined;
  if (!uniteLegale) return null;

  const adresseEtab = etab.adresseEtablissement as
    | Record<string, unknown>
    | undefined;

  // Nom : denominationUniteLegale (sociétés) ou nom + prénom (EI)
  const denomination = uniteLegale.denominationUniteLegale as
    | string
    | null
    | undefined;
  const nomPhysique = uniteLegale.nomUniteLegale as string | null | undefined;
  const prenomPhysique = uniteLegale.prenom1UniteLegale as
    | string
    | null
    | undefined;
  const nom =
    denomination ||
    [prenomPhysique, nomPhysique].filter(Boolean).join(" ") ||
    "";

  if (!nom) return null;

  // Forme juridique
  const categorieJuridique = uniteLegale.categorieJuridiqueUniteLegale as
    | string
    | null
    | undefined;
  const formeJuridique = categorieJuridique
    ? getFormeJuridiqueLabel(categorieJuridique)
    : null;

  // Adresse
  const adresseLigne1 = buildAdresseLigne1({
    numeroVoieEtablissement: adresseEtab?.numeroVoieEtablissement as
      | string
      | null
      | undefined,
    indiceRepetitionEtablissement:
      adresseEtab?.indiceRepetitionEtablissement as string | null | undefined,
    typeVoieEtablissement: adresseEtab?.typeVoieEtablissement as
      | string
      | null
      | undefined,
    libelleVoieEtablissement: adresseEtab?.libelleVoieEtablissement as
      | string
      | null
      | undefined,
  });
  const adresseLigne2 =
    (adresseEtab?.complementAdresseEtablissement as string | null | undefined) ||
    null;
  const codePostal =
    (adresseEtab?.codePostalEtablissement as string | null | undefined) || "";
  const ville =
    (adresseEtab?.libelleCommuneEtablissement as string | null | undefined) ||
    "";

  // TVA
  const siren = (etab.siren as string | undefined) || cleanSiret.slice(0, 9);
  const numeroTva = computeNumeroTva(siren);

  // État
  const etatActif =
    (etab.etatAdministratifEtablissement as string | undefined) === "A";

  return {
    nom,
    formeJuridique,
    adresseLigne1,
    adresseLigne2,
    codePostal,
    ville,
    numeroTva,
    etatActif,
  };
}
