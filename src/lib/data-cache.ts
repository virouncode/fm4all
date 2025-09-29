export type CACHE_TAG =
  | "nettoyageQuantites"
  | "nettoyageProduits"
  | "nettoyageOffres"
  | "nettoyageTarifs"
  | "repasseTarifs"
  | "vitrerieTarifs"
  | "hygieneDistribQuantites"
  | "hygieneDistribTarifs"
  | "hygieneMinFacturation"
  | "hygieneInstalDistribTarifs"
  | "hygieneConsosTarifs"
  | "incendieQuantites"
  | "incendieTarifs"
  | "exutoiresTarifs"
  | "exutoiresParkingTarifs"
  | "alarmesTarifs"
  | "riaTarifs"
  | "colonnesSechesTarifs"
  | "portesCoupeFeuTarifs"
  | "maintenanceQuantites"
  | "maintenanceTarifs"
  | "q18Tarifs"
  | "legioTarifs"
  | "qualiteAirTarifs"
  | "services";

// Type helpers for tag functions
type GlobalTagResult<T extends CACHE_TAG> = `global:${T}`;
type SurfaceTagResult<T extends CACHE_TAG> = `surface:${string}-${T}`;
type EffectifTagResult<T extends CACHE_TAG> = `effectif:${string}-${T}`;
type FournisseurTagResult<T extends CACHE_TAG> = `fournisseur:${number}-${T}`;
type IdTagResult<T extends CACHE_TAG> = `id:${number}-${T}`;
type ProduitTagResult<T extends CACHE_TAG> = `produit:${number}-${T}`;

// Union type of all possible tag formats
export type CACHE_TAG_RESULT =
  | GlobalTagResult<CACHE_TAG>
  | SurfaceTagResult<CACHE_TAG>
  | EffectifTagResult<CACHE_TAG>
  | FournisseurTagResult<CACHE_TAG>
  | IdTagResult<CACHE_TAG>
  | ProduitTagResult<CACHE_TAG>;

export const getGlobalTag = <T extends CACHE_TAG>(
  tag: T,
): GlobalTagResult<T> => {
  return `global:${tag}`;
};

export const getSurfaceTag = <T extends CACHE_TAG>(
  tag: T,
  surface: string,
): SurfaceTagResult<T> => {
  return `surface:${surface}-${tag}`;
};

export const getEffectifTag = <T extends CACHE_TAG>(
  tag: T,
  effectif: string,
): EffectifTagResult<T> => {
  return `effectif:${effectif}-${tag}`;
};

export const getFournisseurTag = <T extends CACHE_TAG>(
  tag: T,
  fournisseurId: number,
): FournisseurTagResult<T> => {
  return `fournisseur:${fournisseurId}-${tag}`;
};

export const getProduitTag = <T extends CACHE_TAG>(
  tag: T,
  produitId: number,
): ProduitTagResult<T> => {
  return `produit:${produitId}-${tag}`;
};

export const getIdTag = <T extends CACHE_TAG>(
  tag: T,
  id: number,
): IdTagResult<T> => {
  return `id:${id}-${tag}`;
};
