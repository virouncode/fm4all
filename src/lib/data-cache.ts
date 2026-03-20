export type CACHE_TAG =
  | "nettoyageQuantites"
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
  | "cafeMachines"
  | "cafeMachinesTarifs"
  | "cafeConsoTarifs"
  | "laitConsoTarifs"
  | "chocolatConsoTarifs"
  | "theConsoTarifs"
  | "sucreConsoTarifs"
  | "fontaines"
  | "fontainesTarifs"
  | "fruitsQuantites"
  | "fruitsTarifs"
  | "snacksQuantites"
  | "snacksTarifs"
  | "boissonsQuantites"
  | "boissonsTarifs"
  | "foodLivraisonTarifs"
  | "officeManagerQuantites"
  | "officeManagerTarifs"
  | "servicesFm4AllTaux"
  | "servicesFm4AllOffres"
  | "services";

// Type helpers for tag functions
type GlobalTagResult<T extends CACHE_TAG> = `global:${T}`;
type SurfaceTagResult<T extends CACHE_TAG> = `surface:${string}-${T}`;
type EffectifTagResult<T extends CACHE_TAG> = `effectif:${string}-${T}`;
type PrestataireTagResult<T extends CACHE_TAG> = `prestataire:${string}-${T}`;
type IdTagResult<T extends CACHE_TAG> = `id:${number}-${T}`;

// Union type of all possible tag formats
export type CACHE_TAG_RESULT =
  | GlobalTagResult<CACHE_TAG>
  | SurfaceTagResult<CACHE_TAG>
  | EffectifTagResult<CACHE_TAG>
  | PrestataireTagResult<CACHE_TAG>
  | IdTagResult<CACHE_TAG>;

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

export const getPrestataireTag = <T extends CACHE_TAG>(
  tag: T,
  entrepriseId: string,
): PrestataireTagResult<T> => {
  return `prestataire:${entrepriseId}-${tag}`;
};

export const getIdTag = <T extends CACHE_TAG>(
  tag: T,
  id: number,
): IdTagResult<T> => {
  return `id:${id}-${tag}`;
};
