"use server";

import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  alarmesTarifs,
  boissonsTarifs,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  chocolatConsoTarifs,
  exutoiresTarifs,
  fontainesTarifs,
  fruitsTarifs,
  hygieneConsoTarifs,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
  incendieTarifs,
  laitConsoTarifs,
  legioTarifs,
  maintenanceTarifs,
  nettoyageRepasseTarifs,
  nettoyageTarifs,
  nettoyageVitrerieTarifs,
  officeManagerTarifs,
  q18Tarifs,
  qualiteAirTarifs,
  servicesFm4AllTaux,
  snacksTarifs,
  sucreConsoTarifs,
  theConsoTarifs,
} from "@/db/schema";
import { actionClient } from "@/lib/action/safe-actions";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import { roundNbPersonnesCafeConso } from "@/lib/utils/roundNbPersonnesCafeConso";
import { roundNbPersonnesCafeMachines } from "@/lib/utils/roundNbPersonnesCafeMachines";
import { roundNbPersonnesFontaine } from "@/lib/utils/roundNbPersonnesFontaine";
import { roundSurface } from "@/lib/utils/roundSurface";
import { CafeEspaceType, CafeType } from "@/zod-schemas/cafe.schema";
import { FontaineEspaceType, FontainesType } from "@/zod-schemas/fontaines.schema";
import { HygieneType } from "@/zod-schemas/hygiene.schema";
import { IncendieType } from "@/zod-schemas/incendie.schema";
import { MaintenanceType } from "@/zod-schemas/maintenance.schema";
import { NettoyageType } from "@/zod-schemas/nettoyage.schema";
import { OfficeManagerType } from "@/zod-schemas/officeManager.schema";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All.schema";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits.schema";
import { TheType } from "@/zod-schemas/the.schema";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { z } from "zod";

// Inline getTypeFontaine logic (avoids importing from a UI component)
function getTypeFontaine(
  typeEau: Array<"Eau froide" | "Eau gazeuse" | "Eau chaude">,
): "EF" | "EG" | "EC" | "ECG" {
  if (typeEau.includes("Eau gazeuse")) {
    if (typeEau.includes("Eau chaude")) return "ECG";
    return "EG";
  } else if (typeEau.includes("Eau chaude")) return "EC";
  return "EF";
}

const verifierCoherenceDevisSchema = z.object({
  surface: z.number().int().positive(),
  effectif: z.number().int().nonnegative(),
  nettoyage: z.any() as z.ZodType<NettoyageType>,
  maintenance: z.any() as z.ZodType<MaintenanceType>,
  hygiene: z.any() as z.ZodType<HygieneType>,
  incendie: z.any() as z.ZodType<IncendieType>,
  snacksFruits: z.any() as z.ZodType<SnacksFruitsType>,
  officeManager: z.any() as z.ZodType<OfficeManagerType>,
  cafe: z.any() as z.ZodType<CafeType>,
  the: z.any() as z.ZodType<TheType>,
  fontaines: z.any() as z.ZodType<FontainesType>,
  servicesFm4All: z.any() as z.ZodType<ServicesFm4AllType>,
});

type VerifierCoherenceDevisInput = z.infer<typeof verifierCoherenceDevisSchema>;

type Corrections = {
  nettoyage?: Partial<NettoyageType["prix"]>;
  maintenance?: Partial<MaintenanceType["prix"]>;
  hygiene?: Partial<HygieneType["prix"]>;
  incendie?: Partial<IncendieType["prix"]>;
  snacksFruits?: Partial<SnacksFruitsType["prix"]>;
  officeManager?: Partial<OfficeManagerType["prix"]>;
  cafe?: Array<{ espaceId: number; prix: Partial<CafeEspaceType["prix"]> }>;
  the?: Partial<TheType["prix"]>;
  fontaines?: Array<{
    espaceId: number;
    prix: Partial<FontaineEspaceType["prix"]>;
  }>;
  servicesFm4All?: Partial<ServicesFm4AllType["prix"]>;
};

function isDifferent(a: number | null, b: number | null): boolean {
  if (a === null && b === null) return false;
  if (a === null || b === null) return true;
  return Math.abs(a - b) > 0.0001;
}

export const verifierCoherenceDevisAction = actionClient
  .metadata({ actionName: "verifierCoherenceDevisAction" })
  .inputSchema(verifierCoherenceDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput,
    }: {
      parsedInput: VerifierCoherenceDevisInput;
    }) => {
      const {
        surface,
        effectif,
        nettoyage,
        maintenance,
        hygiene,
        incendie,
        snacksFruits,
        officeManager,
        cafe,
        the,
        fontaines,
        servicesFm4All,
      } = parsedInput;

      const roundedSurface = roundSurface(surface);
      const roundedEffectif = roundEffectif(effectif);
      const corrections: Corrections = {};

      // --- NETTOYAGE ---
      if (
        nettoyage.infos.entrepriseId !== null &&
        nettoyage.infos.gammeSelected !== null
      ) {
        const [netRow] = await db
          .select({
            tauxHoraire: nettoyageTarifs.tauxHoraire,
          })
          .from(nettoyageTarifs)
          .where(
            and(
              eq(nettoyageTarifs.entrepriseId, nettoyage.infos.entrepriseId),
              eq(nettoyageTarifs.surface, roundedSurface),
              eq(nettoyageTarifs.gamme, nettoyage.infos.gammeSelected),
            ),
          )
          .limit(1);

        if (netRow) {
          const freshTauxHoraire = netRow.tauxHoraire / RATIO;
          const netCorrections: Partial<NettoyageType["prix"]> = {};

          if (isDifferent(nettoyage.prix.tauxHoraire, freshTauxHoraire)) {
            netCorrections.tauxHoraire = freshTauxHoraire;
          }

          // Repasse
          if (nettoyage.infos.repasseSelected) {
            const [repasseRow] = await db
              .select({ tauxHoraire: nettoyageRepasseTarifs.tauxHoraire })
              .from(nettoyageRepasseTarifs)
              .where(
                and(
                  eq(
                    nettoyageRepasseTarifs.entrepriseId,
                    nettoyage.infos.entrepriseId,
                  ),
                  eq(nettoyageRepasseTarifs.surface, roundedSurface),
                ),
              )
              .limit(1);

            if (repasseRow) {
              const freshTauxRepasse = repasseRow.tauxHoraire / RATIO;
              if (isDifferent(nettoyage.prix.tauxHoraireRepasse, freshTauxRepasse)) {
                netCorrections.tauxHoraireRepasse = freshTauxRepasse;
              }
            }
          }

          // Vitrerie
          if (nettoyage.infos.vitrerieSelected) {
            const [vitrRow] = await db
              .select({
                tauxHoraire: nettoyageVitrerieTarifs.tauxHoraire,
                minFacturation: nettoyageVitrerieTarifs.minFacturation,
                fraisDeplacement: nettoyageVitrerieTarifs.fraisDeplacement,
              })
              .from(nettoyageVitrerieTarifs)
              .where(
                eq(
                  nettoyageVitrerieTarifs.entrepriseId,
                  nettoyage.infos.entrepriseId,
                ),
              )
              .limit(1);

            if (vitrRow) {
              const freshTauxVitr = vitrRow.tauxHoraire / RATIO;
              const freshMinFact = vitrRow.minFacturation / RATIO;
              const freshFraisDep = vitrRow.fraisDeplacement / RATIO;

              if (isDifferent(nettoyage.prix.tauxHoraireVitrerie, freshTauxVitr)) {
                netCorrections.tauxHoraireVitrerie = freshTauxVitr;
              }
              if (isDifferent(nettoyage.prix.minFacturationVitrerie, freshMinFact)) {
                netCorrections.minFacturationVitrerie = freshMinFact;
              }
              if (isDifferent(nettoyage.prix.fraisDeplacementVitrerie, freshFraisDep)) {
                netCorrections.fraisDeplacementVitrerie = freshFraisDep;
              }
            }
          }

          if (Object.keys(netCorrections).length > 0) {
            corrections.nettoyage = netCorrections;
          }
        }
      }

      // --- MAINTENANCE ---
      if (
        maintenance.infos.entrepriseId !== null &&
        maintenance.infos.gammeSelected !== null
      ) {
        const [maintRow] = await db
          .select({ tauxHoraire: maintenanceTarifs.tauxHoraire })
          .from(maintenanceTarifs)
          .where(
            and(
              eq(maintenanceTarifs.entrepriseId, maintenance.infos.entrepriseId),
              eq(maintenanceTarifs.surface, roundedSurface),
              eq(maintenanceTarifs.gamme, maintenance.infos.gammeSelected),
            ),
          )
          .limit(1);

        const maintCorrections: Partial<MaintenanceType["prix"]> = {};

        if (maintRow) {
          const freshTaux = maintRow.tauxHoraire / RATIO;
          if (isDifferent(maintenance.prix.tauxHoraire, freshTaux)) {
            maintCorrections.tauxHoraire = freshTaux;
          }
        }

        // Q18
        const [q18Row] = await db
          .select({ prixAnnuel: q18Tarifs.prixAnnuel })
          .from(q18Tarifs)
          .where(
            and(
              eq(q18Tarifs.entrepriseId, maintenance.infos.entrepriseId),
              eq(q18Tarifs.surface, roundedSurface),
            ),
          )
          .limit(1);

        if (q18Row) {
          const freshQ18 = q18Row.prixAnnuel / RATIO;
          if (isDifferent(maintenance.prix.prixQ18, freshQ18)) {
            maintCorrections.prixQ18 = freshQ18;
          }
        }

        // Legio
        if (maintenance.infos.gammeSelected !== "essentiel") {
          const [legioRow] = await db
            .select({ prixAnnuel: legioTarifs.prixAnnuel })
            .from(legioTarifs)
            .where(
              and(
                eq(legioTarifs.entrepriseId, maintenance.infos.entrepriseId),
                eq(legioTarifs.surface, roundedSurface),
              ),
            )
            .limit(1);

          if (legioRow) {
            const freshLegio = legioRow.prixAnnuel / RATIO;
            if (isDifferent(maintenance.prix.prixLegio, freshLegio)) {
              maintCorrections.prixLegio = freshLegio;
            }
          }
        }

        // QualiteAir
        if (maintenance.infos.gammeSelected === "excellence") {
          const [qaRow] = await db
            .select({ prixAnnuel: qualiteAirTarifs.prixAnnuel })
            .from(qualiteAirTarifs)
            .where(
              and(
                eq(qualiteAirTarifs.entrepriseId, maintenance.infos.entrepriseId),
                eq(qualiteAirTarifs.surface, roundedSurface),
              ),
            )
            .limit(1);

          if (qaRow) {
            const freshQa = qaRow.prixAnnuel / RATIO;
            if (isDifferent(maintenance.prix.prixQualiteAir, freshQa)) {
              maintCorrections.prixQualiteAir = freshQa;
            }
          }
        }

        if (Object.keys(maintCorrections).length > 0) {
          corrections.maintenance = maintCorrections;
        }
      }

      // --- HYGIENE ---
      if (hygiene.infos.entrepriseId !== null) {
        const hygieneCorrections: Partial<HygieneType["prix"]> = {};

        // Min facturation
        const [minFactRow] = await db
          .select({ minFacturation: hygieneMinFacturation.minFacturation })
          .from(hygieneMinFacturation)
          .where(
            eq(hygieneMinFacturation.entrepriseId, hygiene.infos.entrepriseId),
          )
          .limit(1);

        if (minFactRow && minFactRow.minFacturation !== null) {
          const freshMinFact = minFactRow.minFacturation / RATIO;
          if (isDifferent(hygiene.prix.minFacturation, freshMinFact)) {
            hygieneCorrections.minFacturation = freshMinFact;
          }
        }

        // Conso tarifs (per effectif)
        if (effectif > 0) {
          const [consoRow] = await db
            .select({
              paParPersonneEmp: hygieneConsoTarifs.paParPersonneEmp,
              paParPersonneSavon: hygieneConsoTarifs.paParPersonneSavon,
              paParPersonnePh: hygieneConsoTarifs.paParPersonnePh,
              paParPersonneDesinfectant:
                hygieneConsoTarifs.paParPersonneDesinfectant,
            })
            .from(hygieneConsoTarifs)
            .where(
              and(
                eq(
                  hygieneConsoTarifs.entrepriseId,
                  hygiene.infos.entrepriseId,
                ),
                eq(hygieneConsoTarifs.effectif, roundedEffectif),
              ),
            )
            .limit(1);

          if (consoRow) {
            const freshEmp = consoRow.paParPersonneEmp / RATIO;
            const freshSavon = consoRow.paParPersonneSavon / RATIO;
            const freshPh = consoRow.paParPersonnePh / RATIO;
            const freshDesinfectant =
              consoRow.paParPersonneDesinfectant / RATIO;

            if (isDifferent(hygiene.prix.paParPersonneEmp, freshEmp))
              hygieneCorrections.paParPersonneEmp = freshEmp;
            if (isDifferent(hygiene.prix.paParPersonneSavon, freshSavon))
              hygieneCorrections.paParPersonneSavon = freshSavon;
            if (isDifferent(hygiene.prix.paParPersonnePh, freshPh))
              hygieneCorrections.paParPersonnePh = freshPh;
            if (
              isDifferent(
                hygiene.prix.paParPersonneDesinfectant,
                freshDesinfectant,
              )
            )
              hygieneCorrections.paParPersonneDesinfectant = freshDesinfectant;
          }

          // Installation
          const [instalRow] = await db
            .select({
              prixInstallation:
                hygieneInstalDistribTarifs.prixInstallation,
            })
            .from(hygieneInstalDistribTarifs)
            .where(
              and(
                eq(
                  hygieneInstalDistribTarifs.entrepriseId,
                  hygiene.infos.entrepriseId,
                ),
                eq(hygieneInstalDistribTarifs.effectif, roundedEffectif),
              ),
            )
            .limit(1);

          if (instalRow) {
            const freshInstal = instalRow.prixInstallation / RATIO;
            if (isDifferent(hygiene.prix.prixInstalDistrib, freshInstal)) {
              hygieneCorrections.prixInstalDistrib = freshInstal;
            }
          }
        }

        // Distrib tarifs — check key types per gamme
        const distribChecks: Array<{
          type: "emp" | "savon" | "ph" | "desinfectant" | "parfum" | "balai" | "poubelle";
          gamme: "essentiel" | "confort" | "excellence" | null;
          currentPrix: number | null;
          prixField: keyof HygieneType["prix"];
        }> = [
          {
            type: "emp",
            gamme: hygiene.infos.trilogieGammeSelected,
            currentPrix: hygiene.prix.prixDistribEmp,
            prixField: "prixDistribEmp",
          },
          {
            type: "savon",
            gamme: hygiene.infos.trilogieGammeSelected,
            currentPrix: hygiene.prix.prixDistribSavon,
            prixField: "prixDistribSavon",
          },
          {
            type: "ph",
            gamme: hygiene.infos.trilogieGammeSelected,
            currentPrix: hygiene.prix.prixDistribPh,
            prixField: "prixDistribPh",
          },
          {
            type: "desinfectant",
            gamme: hygiene.infos.desinfectantGammeSelected,
            currentPrix: hygiene.prix.prixDistribDesinfectant,
            prixField: "prixDistribDesinfectant",
          },
          {
            type: "parfum",
            gamme: hygiene.infos.parfumGammeSelected,
            currentPrix: hygiene.prix.prixDistribParfum,
            prixField: "prixDistribParfum",
          },
          {
            type: "balai",
            gamme: hygiene.infos.balaiGammeSelected,
            currentPrix: hygiene.prix.prixDistribBalai,
            prixField: "prixDistribBalai",
          },
          {
            type: "poubelle",
            gamme: hygiene.infos.poubelleGammeSelected,
            currentPrix: hygiene.prix.prixDistribPoubelle,
            prixField: "prixDistribPoubelle",
          },
        ];

        const dureeLocation = hygiene.infos.dureeLocation;

        for (const check of distribChecks) {
          if (check.gamme === null) continue;

          const [distribRow] = await db
            .select({
              oneShot: hygieneDistribTarifs.oneShot,
              pa12M: hygieneDistribTarifs.pa12M,
              pa24M: hygieneDistribTarifs.pa24M,
              pa36M: hygieneDistribTarifs.pa36M,
            })
            .from(hygieneDistribTarifs)
            .where(
              and(
                eq(
                  hygieneDistribTarifs.entrepriseId,
                  hygiene.infos.entrepriseId,
                ),
                eq(hygieneDistribTarifs.type, check.type),
                eq(hygieneDistribTarifs.gamme, check.gamme),
              ),
            )
            .limit(1);

          if (distribRow) {
            const rawPrix = distribRow[dureeLocation];
            if (rawPrix !== null && rawPrix !== undefined) {
              const freshPrix = rawPrix / RATIO;
              if (isDifferent(check.currentPrix, freshPrix)) {
                hygieneCorrections[check.prixField] = freshPrix;
              }
            }
          }
        }

        if (Object.keys(hygieneCorrections).length > 0) {
          corrections.hygiene = hygieneCorrections;
        }
      }

      // --- INCENDIE ---
      if (incendie.infos.entrepriseId !== null) {
        const incCorrections: Partial<IncendieType["prix"]> = {};

        const [incRow] = await db
          .select({
            prixParExtincteur: incendieTarifs.prixParExtincteur,
            prixParBaes: incendieTarifs.prixParBaes,
            prixParTelBaes: incendieTarifs.prixParTelBaes,
            fraisDeplacement: incendieTarifs.fraisDeplacement,
          })
          .from(incendieTarifs)
          .where(
            and(
              eq(incendieTarifs.entrepriseId, incendie.infos.entrepriseId),
              eq(incendieTarifs.surface, roundedSurface),
            ),
          )
          .limit(1);

        if (incRow) {
          const freshExt = incRow.prixParExtincteur / RATIO;
          const freshBaes = incRow.prixParBaes / RATIO;
          const freshTelBaes = incRow.prixParTelBaes / RATIO;
          const freshFrais = incRow.fraisDeplacement / RATIO;

          if (isDifferent(incendie.prix.prixParExtincteur, freshExt))
            incCorrections.prixParExtincteur = freshExt;
          if (isDifferent(incendie.prix.prixParBaes, freshBaes))
            incCorrections.prixParBaes = freshBaes;
          if (isDifferent(incendie.prix.prixParTelBaes, freshTelBaes))
            incCorrections.prixParTelBaes = freshTelBaes;
          if (isDifferent(incendie.prix.fraisDeplacementTrilogie, freshFrais))
            incCorrections.fraisDeplacementTrilogie = freshFrais;
        }

        // Exutoires
        if (
          incendie.quantites.nbExutoires !== null &&
          incendie.quantites.nbExutoires > 0
        ) {
          const [exutRow] = await db
            .select({
              prixParExutoire: exutoiresTarifs.prixParExutoire,
              fraisDeplacement: exutoiresTarifs.fraisDeplacement,
            })
            .from(exutoiresTarifs)
            .where(
              and(
                eq(exutoiresTarifs.entrepriseId, incendie.infos.entrepriseId),
                eq(
                  exutoiresTarifs.nbExutoires,
                  incendie.quantites.nbExutoires,
                ),
              ),
            )
            .limit(1);

          if (exutRow) {
            const freshPrixExut = exutRow.prixParExutoire / RATIO;
            const freshFraisExut = exutRow.fraisDeplacement / RATIO;

            if (isDifferent(incendie.prix.prixParExutoire, freshPrixExut))
              incCorrections.prixParExutoire = freshPrixExut;
            if (isDifferent(incendie.prix.fraisDeplacementExutoires, freshFraisExut))
              incCorrections.fraisDeplacementExutoires = freshFraisExut;
          }
        }

        // Alarmes
        if (
          incendie.quantites.nbAlarmes !== null &&
          incendie.quantites.nbAlarmes > 0
        ) {
          const [alarmRow] = await db
            .select({ prixParControle: alarmesTarifs.prixParControle })
            .from(alarmesTarifs)
            .where(
              and(
                eq(alarmesTarifs.entrepriseId, incendie.infos.entrepriseId),
                eq(alarmesTarifs.nbPoints, incendie.quantites.nbAlarmes),
              ),
            )
            .limit(1);

          if (alarmRow) {
            const freshPrixAlarme = alarmRow.prixParControle / RATIO;
            if (isDifferent(incendie.prix.prixParAlarme, freshPrixAlarme))
              incCorrections.prixParAlarme = freshPrixAlarme;
          }
        }

        if (Object.keys(incCorrections).length > 0) {
          corrections.incendie = incCorrections;
        }
      }

      // --- SNACKS & FRUITS ---
      if (
        snacksFruits.infos.entrepriseId !== null &&
        snacksFruits.infos.gammeSelected !== null &&
        effectif > 0
      ) {
        const snackCorrections: Partial<SnacksFruitsType["prix"]> = {};
        const roundedEff = roundedEffectif;

        if (snacksFruits.infos.choix.includes("fruits")) {
          const [fruitsRow] = await db
            .select({ prixKg: fruitsTarifs.prixKg })
            .from(fruitsTarifs)
            .where(
              and(
                eq(fruitsTarifs.entrepriseId, snacksFruits.infos.entrepriseId),
                eq(fruitsTarifs.gamme, snacksFruits.infos.gammeSelected),
                eq(fruitsTarifs.effectif, roundedEff),
              ),
            )
            .limit(1);

          if (fruitsRow && fruitsRow.prixKg !== null) {
            const freshPrixKg = fruitsRow.prixKg / RATIO;
            if (isDifferent(snacksFruits.prix.prixKgFruits, freshPrixKg)) {
              snackCorrections.prixKgFruits = freshPrixKg;
            }
          }
        }

        if (snacksFruits.infos.choix.includes("snacks")) {
          const [snacksRow] = await db
            .select({ prixUnitaire: snacksTarifs.prixUnitaire })
            .from(snacksTarifs)
            .where(
              and(
                eq(snacksTarifs.entrepriseId, snacksFruits.infos.entrepriseId),
                eq(snacksTarifs.gamme, snacksFruits.infos.gammeSelected),
                eq(snacksTarifs.effectif, roundedEff),
              ),
            )
            .limit(1);

          if (snacksRow && snacksRow.prixUnitaire !== null) {
            const freshPrixSnacks = snacksRow.prixUnitaire / RATIO;
            if (
              isDifferent(
                snacksFruits.prix.prixUnitaireSnacks,
                freshPrixSnacks,
              )
            ) {
              snackCorrections.prixUnitaireSnacks = freshPrixSnacks;
            }
          }
        }

        if (snacksFruits.infos.choix.includes("boissons")) {
          const [boissonsRow] = await db
            .select({ prixUnitaire: boissonsTarifs.prixUnitaire })
            .from(boissonsTarifs)
            .where(
              and(
                eq(
                  boissonsTarifs.entrepriseId,
                  snacksFruits.infos.entrepriseId,
                ),
                eq(boissonsTarifs.gamme, snacksFruits.infos.gammeSelected),
                eq(boissonsTarifs.effectif, roundedEff),
              ),
            )
            .limit(1);

          if (boissonsRow && boissonsRow.prixUnitaire !== null) {
            const freshPrixBoissons = boissonsRow.prixUnitaire / RATIO;
            if (
              isDifferent(
                snacksFruits.prix.prixUnitaireBoissons,
                freshPrixBoissons,
              )
            ) {
              snackCorrections.prixUnitaireBoissons = freshPrixBoissons;
            }
          }
        }

        if (Object.keys(snackCorrections).length > 0) {
          corrections.snacksFruits = snackCorrections;
        }
      }

      // --- OFFICE MANAGER ---
      if (officeManager.infos.entrepriseId !== null) {
        const [omRow] = await db
          .select({
            demiTjm: officeManagerTarifs.demiTjm,
            demiTjmPremium: officeManagerTarifs.demiTjmPremium,
          })
          .from(officeManagerTarifs)
          .where(
            eq(
              officeManagerTarifs.entrepriseId,
              officeManager.infos.entrepriseId,
            ),
          )
          .limit(1);

        if (omRow) {
          const omCorrections: Partial<OfficeManagerType["prix"]> = {};
          const freshDemiTjm = omRow.demiTjm / RATIO;
          const freshDemiTjmPremium = omRow.demiTjmPremium / RATIO;

          if (isDifferent(officeManager.prix.demiTjm, freshDemiTjm))
            omCorrections.demiTjm = freshDemiTjm;
          if (isDifferent(officeManager.prix.demiTjmPremium, freshDemiTjmPremium))
            omCorrections.demiTjmPremium = freshDemiTjmPremium;

          if (Object.keys(omCorrections).length > 0) {
            corrections.officeManager = omCorrections;
          }
        }
      }

      // --- CAFÉ ---
      if (cafe.infos.entrepriseId !== null) {
        const cafeEspaceCorrections: Array<{
          espaceId: number;
          prix: Partial<CafeEspaceType["prix"]>;
        }> = [];

        for (const espace of cafe.espaces) {
          if (espace.infos.gammeCafeSelected === null) continue;
          const nbPersonnes = espace.quantites.nbPersonnes;
          if (nbPersonnes === null) continue;

          const espaceCorrections: Partial<CafeEspaceType["prix"]> = {};
          const roundedMachines = roundNbPersonnesCafeMachines(nbPersonnes);
          const roundedConso = roundNbPersonnesCafeConso(nbPersonnes);
          const dureeLocation = cafe.infos.dureeLocation;

          // Machine tarif
          const [machRow] = await db
            .select({
              oneShot: cafeMachinesTarifs.oneShot,
              pa12M: cafeMachinesTarifs.pa12M,
              pa24M: cafeMachinesTarifs.pa24M,
              pa36M: cafeMachinesTarifs.pa36M,
              pa48M: cafeMachinesTarifs.pa48M,
              paMaintenance: cafeMachinesTarifs.paMaintenance,
              fraisInstallation: cafeMachinesTarifs.fraisInstallation,
            })
            .from(cafeMachinesTarifs)
            .where(
              and(
                eq(cafeMachinesTarifs.entrepriseId, cafe.infos.entrepriseId),
                eq(cafeMachinesTarifs.type, espace.infos.typeBoissons),
                eq(cafeMachinesTarifs.nbPersonnes, roundedMachines),
              ),
            )
            .limit(1);

          if (machRow) {
            const rawLoc = machRow[dureeLocation];
            if (rawLoc !== null && rawLoc !== undefined) {
              const freshPrixLoc = rawLoc / RATIO;
              if (isDifferent(espace.prix.prixLoc, freshPrixLoc))
                espaceCorrections.prixLoc = freshPrixLoc;
            }
            if (machRow.fraisInstallation !== null) {
              const freshInstal = machRow.fraisInstallation / RATIO;
              if (isDifferent(espace.prix.prixInstal, freshInstal))
                espaceCorrections.prixInstal = freshInstal;
            }
            if (machRow.paMaintenance !== null) {
              const freshMaint = machRow.paMaintenance / RATIO;
              if (isDifferent(espace.prix.prixMaintenance, freshMaint))
                espaceCorrections.prixMaintenance = freshMaint;
            }
          }

          // Café conso tarif
          const [cafeConsoRow] = await db
            .select({ prixUnitaire: cafeConsoTarifs.prixUnitaire })
            .from(cafeConsoTarifs)
            .where(
              and(
                eq(cafeConsoTarifs.entrepriseId, cafe.infos.entrepriseId),
                eq(cafeConsoTarifs.gamme, espace.infos.gammeCafeSelected),
                eq(cafeConsoTarifs.effectif, roundedConso),
              ),
            )
            .limit(1);

          if (cafeConsoRow && cafeConsoRow.prixUnitaire !== null) {
            const freshCafe = cafeConsoRow.prixUnitaire / RATIO;
            if (isDifferent(espace.prix.prixUnitaireConsoCafe, freshCafe))
              espaceCorrections.prixUnitaireConsoCafe = freshCafe;
          }

          // Lait conso tarif (only when typeLait is set)
          if (espace.infos.typeLait !== null) {
            const [laitRow] = await db
              .select({
                prixUnitaireDosette: laitConsoTarifs.prixUnitaireDosette,
                prixUnitaireFrais: laitConsoTarifs.prixUnitaireFrais,
                prixUnitairePoudre: laitConsoTarifs.prixUnitairePoudre,
              })
              .from(laitConsoTarifs)
              .where(
                and(
                  eq(laitConsoTarifs.entrepriseId, cafe.infos.entrepriseId),
                  eq(laitConsoTarifs.effectif, roundedConso),
                ),
              )
              .limit(1);

            if (laitRow) {
              const rawLait =
                espace.infos.typeLait === "dosettes"
                  ? laitRow.prixUnitaireDosette
                  : espace.infos.typeLait === "frais"
                    ? laitRow.prixUnitaireFrais
                    : laitRow.prixUnitairePoudre;
              if (rawLait !== null && rawLait !== undefined) {
                const freshLait = rawLait / RATIO;
                if (isDifferent(espace.prix.prixUnitaireConsoLait, freshLait))
                  espaceCorrections.prixUnitaireConsoLait = freshLait;
              }
            }
          }

          // Chocolat conso tarif (only when typeChocolat is set)
          if (espace.infos.typeChocolat !== null) {
            const [chocolatRow] = await db
              .select({
                prixUnitaireSachet: chocolatConsoTarifs.prixUnitaireSachet,
                prixUnitairePoudre: chocolatConsoTarifs.prixUnitairePoudre,
              })
              .from(chocolatConsoTarifs)
              .where(
                and(
                  eq(
                    chocolatConsoTarifs.entrepriseId,
                    cafe.infos.entrepriseId,
                  ),
                  eq(chocolatConsoTarifs.effectif, roundedConso),
                ),
              )
              .limit(1);

            if (chocolatRow) {
              const rawChoco =
                espace.infos.typeChocolat === "sachets"
                  ? chocolatRow.prixUnitaireSachet
                  : chocolatRow.prixUnitairePoudre;
              if (rawChoco !== null && rawChoco !== undefined) {
                const freshChoco = rawChoco / RATIO;
                if (
                  isDifferent(
                    espace.prix.prixUnitaireConsoChocolat,
                    freshChoco,
                  )
                )
                  espaceCorrections.prixUnitaireConsoChocolat = freshChoco;
              }
            }
          }

          // Sucre conso tarif
          const [sucreRow] = await db
            .select({ prixUnitaire: sucreConsoTarifs.prixUnitaire })
            .from(sucreConsoTarifs)
            .where(
              and(
                eq(sucreConsoTarifs.entrepriseId, cafe.infos.entrepriseId),
                eq(sucreConsoTarifs.effectif, roundedConso),
              ),
            )
            .limit(1);

          if (sucreRow && sucreRow.prixUnitaire !== null) {
            const freshSucre = sucreRow.prixUnitaire / RATIO;
            if (isDifferent(espace.prix.prixUnitaireConsoSucre, freshSucre))
              espaceCorrections.prixUnitaireConsoSucre = freshSucre;
          }

          if (Object.keys(espaceCorrections).length > 0) {
            cafeEspaceCorrections.push({
              espaceId: espace.infos.espaceId,
              prix: espaceCorrections,
            });
          }
        }

        if (cafeEspaceCorrections.length > 0) {
          corrections.cafe = cafeEspaceCorrections;
        }
      }

      // --- THÉ ---
      if (
        the.infos.gammeSelected !== null &&
        cafe.infos.entrepriseId !== null
      ) {
        const nbPersonnesThe =
          the.quantites.nbPersonnes ?? Math.round(effectif * 0.15);
        const theEffectif = roundNbPersonnesCafeConso(nbPersonnesThe / 0.15);

        const [theRow] = await db
          .select({ prixUnitaire: theConsoTarifs.prixUnitaire })
          .from(theConsoTarifs)
          .where(
            and(
              eq(theConsoTarifs.entrepriseId, cafe.infos.entrepriseId),
              eq(theConsoTarifs.gamme, the.infos.gammeSelected),
              eq(theConsoTarifs.effectif, theEffectif),
            ),
          )
          .limit(1);

        if (theRow && theRow.prixUnitaire !== null) {
          const freshThe = theRow.prixUnitaire / RATIO;
          if (isDifferent(the.prix.prixUnitaire, freshThe)) {
            corrections.the = { prixUnitaire: freshThe };
          }
        }
      }

      // --- FONTAINES ---
      if (fontaines.infos.entrepriseId !== null) {
        const fontainesEspaceCorrections: Array<{
          espaceId: number;
          prix: Partial<FontaineEspaceType["prix"]>;
        }> = [];

        for (const espace of fontaines.espaces) {
          if (espace.infos.poseSelected === null) continue;
          const nbPersonnes = espace.quantites.nbPersonnes;
          if (nbPersonnes === null) continue;

          const espaceCorrections: Partial<FontaineEspaceType["prix"]> = {};
          const typeFontaine = getTypeFontaine(espace.infos.typeEau);
          const roundedNbPersonnes = roundNbPersonnesFontaine(nbPersonnes);
          const dureeLocation = fontaines.infos.dureeLocation;

          const [fontRow] = await db
            .select({
              oneShot: fontainesTarifs.oneShot,
              pa12M: fontainesTarifs.pa12M,
              pa24M: fontainesTarifs.pa24M,
              pa36M: fontainesTarifs.pa36M,
              pa48M: fontainesTarifs.pa48M,
              pa60M: fontainesTarifs.pa60M,
              paMaintenance: fontainesTarifs.paMaintenance,
              fraisInstallation: fontainesTarifs.fraisInstallation,
              paConsoFiltres: fontainesTarifs.paConsoFiltres,
              paConsoCO2: fontainesTarifs.paConsoCO2,
              paConsoEauChaude: fontainesTarifs.paConsoEauChaude,
            })
            .from(fontainesTarifs)
            .where(
              and(
                eq(fontainesTarifs.entrepriseId, fontaines.infos.entrepriseId),
                eq(fontainesTarifs.type, typeFontaine),
                eq(fontainesTarifs.typePose, espace.infos.poseSelected),
                eq(fontainesTarifs.nbPersonnes, roundedNbPersonnes),
              ),
            )
            .limit(1);

          if (fontRow) {
            const rawLoc = fontRow[dureeLocation];
            if (rawLoc !== null && rawLoc !== undefined) {
              const freshPrixLoc = rawLoc / RATIO;
              if (isDifferent(espace.prix.prixLoc, freshPrixLoc))
                espaceCorrections.prixLoc = freshPrixLoc;
            }
            if (fontRow.fraisInstallation !== null) {
              const freshInstal = fontRow.fraisInstallation / RATIO;
              if (isDifferent(espace.prix.prixInstal, freshInstal))
                espaceCorrections.prixInstal = freshInstal;
            }
            if (fontRow.paMaintenance !== null) {
              const freshMaint = fontRow.paMaintenance / RATIO;
              if (isDifferent(espace.prix.prixMaintenance, freshMaint))
                espaceCorrections.prixMaintenance = freshMaint;
            }
            if (fontRow.paConsoFiltres !== null) {
              const freshFiltres = fontRow.paConsoFiltres / RATIO;
              if (
                isDifferent(espace.prix.prixUnitaireConsoFiltres, freshFiltres)
              )
                espaceCorrections.prixUnitaireConsoFiltres = freshFiltres;
            }
            if (fontRow.paConsoCO2 !== null) {
              const freshCO2 = fontRow.paConsoCO2 / RATIO;
              if (isDifferent(espace.prix.prixUnitaireConsoCO2, freshCO2))
                espaceCorrections.prixUnitaireConsoCO2 = freshCO2;
            }
            if (fontRow.paConsoEauChaude !== null) {
              const freshEauChaude = fontRow.paConsoEauChaude / RATIO;
              if (
                isDifferent(
                  espace.prix.prixUnitaireConsoEauChaude,
                  freshEauChaude,
                )
              )
                espaceCorrections.prixUnitaireConsoEauChaude = freshEauChaude;
            }
          }

          if (Object.keys(espaceCorrections).length > 0) {
            fontainesEspaceCorrections.push({
              espaceId: espace.infos.espaceId,
              prix: espaceCorrections,
            });
          }
        }

        if (fontainesEspaceCorrections.length > 0) {
          corrections.fontaines = fontainesEspaceCorrections;
        }
      }

      // --- SERVICES FM4ALL ---
      if (servicesFm4All.infos.gammeSelected !== null) {
        const [tauxRow] = await db
          .select()
          .from(servicesFm4AllTaux)
          .limit(1);

        if (tauxRow) {
          const sfCorrections: Partial<ServicesFm4AllType["prix"]> = {};

          const freshAssurance = tauxRow.assurance / (RATIO * 100);
          const freshPlateforme = tauxRow.plateforme / (RATIO * 100);
          const freshMinPlateforme = tauxRow.minFacturationPlateforme / RATIO;
          const freshSupportAdmin = tauxRow.supportAdmin / (RATIO * 100);
          const freshSupportOp = tauxRow.supportOp / (RATIO * 100);
          const freshMinSupportOp = tauxRow.minFacturationSupportOp / RATIO;
          const freshAccountManager = tauxRow.accountManager / (RATIO * 100);
          const freshMinAccountManager =
            tauxRow.minFacturationAccountManager / RATIO;
          const freshRemiseCaSeuil = tauxRow.remiseCaSeuil / RATIO;
          const freshRemiseCa = tauxRow.remiseCa / (RATIO * 100);
          const freshRemiseHof = tauxRow.remiseHof / (RATIO * 100);

          if (isDifferent(servicesFm4All.prix.tauxAssurance, freshAssurance))
            sfCorrections.tauxAssurance = freshAssurance;
          if (isDifferent(servicesFm4All.prix.tauxPlateforme, freshPlateforme))
            sfCorrections.tauxPlateforme = freshPlateforme;
          if (
            isDifferent(
              servicesFm4All.prix.minFacturationPlateforme,
              freshMinPlateforme,
            )
          )
            sfCorrections.minFacturationPlateforme = freshMinPlateforme;
          if (
            isDifferent(servicesFm4All.prix.tauxSupportAdmin, freshSupportAdmin)
          )
            sfCorrections.tauxSupportAdmin = freshSupportAdmin;
          if (
            isDifferent(servicesFm4All.prix.tauxSupportOp, freshSupportOp)
          )
            sfCorrections.tauxSupportOp = freshSupportOp;
          if (
            isDifferent(
              servicesFm4All.prix.minFacturationSupportOp,
              freshMinSupportOp,
            )
          )
            sfCorrections.minFacturationSupportOp = freshMinSupportOp;
          if (
            isDifferent(
              servicesFm4All.prix.tauxAccountManager,
              freshAccountManager,
            )
          )
            sfCorrections.tauxAccountManager = freshAccountManager;
          if (
            isDifferent(
              servicesFm4All.prix.minFacturationAccountManager,
              freshMinAccountManager,
            )
          )
            sfCorrections.minFacturationAccountManager = freshMinAccountManager;
          if (
            isDifferent(servicesFm4All.prix.remiseCaSeuil, freshRemiseCaSeuil)
          )
            sfCorrections.remiseCaSeuil = freshRemiseCaSeuil;
          if (isDifferent(servicesFm4All.prix.tauxRemiseCa, freshRemiseCa))
            sfCorrections.tauxRemiseCa = freshRemiseCa;
          if (isDifferent(servicesFm4All.prix.tauxRemiseHof, freshRemiseHof))
            sfCorrections.tauxRemiseHof = freshRemiseHof;

          if (Object.keys(sfCorrections).length > 0) {
            corrections.servicesFm4All = sfCorrections;
          }
        }
      }

      const coherent = Object.keys(corrections).length === 0;

      return { coherent, corrections };
    },
  );
