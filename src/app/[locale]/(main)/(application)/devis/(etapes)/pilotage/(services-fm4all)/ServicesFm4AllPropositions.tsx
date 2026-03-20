import { MARGE } from "@/constants/constants";
import { calcCafeTotaux } from "@/lib/devis/calc-cafe";
import { calcFontainesTotaux } from "@/lib/devis/calc-fontaines";
import { calcHygieneTotaux } from "@/lib/devis/calc-hygiene";
import { calcIncendieTotaux } from "@/lib/devis/calc-incendie";
import { calcMaintenanceTotaux } from "@/lib/devis/calc-maintenance";
import { calcNettoyageTotaux } from "@/lib/devis/calc-nettoyage";
import { calcOfficeManagerTotaux } from "@/lib/devis/calc-office-manager";
import { calcSnacksFruitsTotaux } from "@/lib/devis/calc-snacks-fruits";
import { calcTheTotaux } from "@/lib/devis/calc-the";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useIncendieStore } from "@/stores/devis/incendieStore";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { useServicesFm4AllStore } from "@/stores/devis/servicesFm4AllStore";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useTheStore } from "@/stores/devis/theStore";
import { GammeType } from "@/zod-schemas/gamme.schema";
import { ServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4All.schema";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType.schema";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux.schema";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import ServicesFm4allDesktopPropositions from "./(desktop)/ServicesFm4allDesktopPropositions";
import ServicesFm4allMobilePropositions from "./(mobile)/ServicesFm4allMobilePropositions";

type ServicesFm4AllPropositionsProps = {
  servicesFm4AllTaux: SelectServicesFm4AllTauxType[];
  servicesFm4AllOffres: SelectServicesFm4AllOffresType[];
};

const ServicesFm4AllPropositions = ({
  servicesFm4AllTaux,
  servicesFm4AllOffres,
}: ServicesFm4AllPropositionsProps) => {
  const { servicesFm4All, setServicesFm4All } = useServicesFm4AllStore(
    useShallow((s) => ({
      servicesFm4All: s.servicesFm4All,
      setServicesFm4All: s.setServicesFm4All,
    })),
  );
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const hygiene = useHygieneStore((s) => s.hygiene);
  const maintenance = useMaintenanceStore((s) => s.maintenance);
  const incendie = useIncendieStore((s) => s.incendie);
  const cafe = useCafeStore((s) => s.cafe);
  const the = useTheStore((s) => s.the);
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const fontaines = useFontainesStore((s) => s.fontaines);
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
  const effectif = useProspectStore((s) => s.prospect.effectif ?? 0);
  const {
    assurance: tauxAssurance,
    plateforme: tauxPlateforme,
    minFacturationPlateforme,
    supportAdmin: tauxSupportAdmin,
    supportOp: tauxSupportOp,
    minFacturationSupportOp,
    accountManager: tauxAccountManager,
    minFacturationAccountManager,
    remiseCaSeuil,
    remiseCa: tauxRemiseCa,
    remiseHof: tauxRemiseHof,
  } = servicesFm4AllTaux[0];

  //Calcul des propositions
  const totalFinalNettoyage = Object.values(calcNettoyageTotaux(nettoyage))
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalHygiene = Object.values(calcHygieneTotaux(hygiene, effectif))
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalMaintenance = Object.values(calcMaintenanceTotaux(maintenance))
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalIncendie = Object.values(calcIncendieTotaux(incendie))
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  //TODO voir pour les prix one shot d'installation
  const totalFinalCafe = calcCafeTotaux(cafe).totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalFinalThe = calcTheTotaux(the).totalService ?? 0;
  const totalFinalSnacksFruits = calcSnacksFruitsTotaux(snacksFruits, totalFinalCafe).total ?? 0;
  const totalFinalFontaines = calcFontainesTotaux(fontaines).totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalFinalOfficeManager =
    calcOfficeManagerTotaux(officeManager).totalService ?? 0;
  const total =
    totalFinalNettoyage +
    totalFinalHygiene +
    totalFinalMaintenance +
    totalFinalIncendie +
    totalFinalCafe +
    totalFinalThe +
    totalFinalSnacksFruits +
    totalFinalFontaines +
    totalFinalOfficeManager;

  const formattedPropositions = servicesFm4AllOffres.map((offre) => {
    const {
      id,
      assurance,
      plateforme,
      supportAdmin,
      supportOp,
      accountManager,
      audit,
      gamme,
    } = offre;
    const prixAssurance =
      assurance === "non propose"
        ? null
        : assurance === "inclus"
          ? 0
          : tauxAssurance * total * MARGE;
    const prixPlateforme =
      plateforme === "non propose"
        ? null
        : plateforme === "inclus"
          ? 0
          : Math.max(tauxPlateforme * total * MARGE, minFacturationPlateforme);
    const prixSupportAdmin =
      supportAdmin === "non propose"
        ? null
        : supportAdmin === "inclus"
          ? 0
          : tauxSupportAdmin * total * MARGE;
    const prixSupportOp =
      supportOp === "non propose"
        ? null
        : supportOp === "inclus"
          ? 0
          : Math.max(tauxSupportOp * total * MARGE, minFacturationSupportOp);
    const prixAccountManager =
      accountManager === "non propose"
        ? null
        : accountManager === "inclus"
          ? 0
          : Math.max(
              tauxAccountManager * total * MARGE,
              minFacturationAccountManager,
            );
    const remiseCa =
      total * MARGE >= remiseCaSeuil ? tauxRemiseCa * total * MARGE : 0;
    const remiseHof = officeManager.infos.gammeSelected
      ? tauxRemiseHof * total * MARGE
      : 0;
    const totalAnnuel =
      (prixAssurance ?? 0) +
      (prixPlateforme ?? 0) +
      (prixSupportAdmin ?? 0) +
      (prixSupportOp ?? 0) +
      (prixAccountManager ?? 0) -
      remiseCa -
      remiseHof;

    const totalAnnuelSansRemise =
      (prixAssurance ?? 0) +
      (prixPlateforme ?? 0) +
      (prixSupportAdmin ?? 0) +
      (prixSupportOp ?? 0) +
      (prixAccountManager ?? 0);

    return {
      id,
      gamme,
      tauxAssurance,
      tauxPlateforme,
      tauxSupportAdmin,
      tauxSupportOp,
      tauxAccountManager,
      tauxRemiseCa,
      tauxRemiseHof,
      prixAssurance,
      prixPlateforme,
      prixSupportAdmin,
      prixSupportOp,
      prixAccountManager,
      assurance,
      plateforme,
      supportAdmin,
      supportOp,
      accountManager,
      audit,
      minFacturationPlateforme,
      minFacturationSupportOp,
      minFacturationAccountManager,
      remiseCaSeuil,
      remiseCa,
      remiseHof,
      totalAnnuel,
      totalAnnuelSansRemise,
    };
  });

  const handleClickProposition = (proposition: {
    id: string;
    gamme: GammeType;
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }) => {
    const {
      gamme,
      tauxAssurance,
      tauxPlateforme,
      tauxSupportAdmin,
      tauxSupportOp,
      tauxAccountManager,
      tauxRemiseCa,
      tauxRemiseHof,
      prixAssurance,
      prixPlateforme,
      prixSupportAdmin,
      prixSupportOp,
      prixAccountManager,
      assurance,
      plateforme,
      supportAdmin,
      supportOp,
      accountManager,
      audit,
      minFacturationPlateforme,
      minFacturationSupportOp,
      minFacturationAccountManager,
      remiseCaSeuil,
      remiseCa,
      remiseHof,
    } = proposition;
    if (servicesFm4All.infos.gammeSelected === gamme) return;

    setServicesFm4All((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        gammeSelected: gamme,
        assurance,
        plateforme,
        supportAdmin,
        supportOp,
        accountManager,
        audit,
      },
      prix: {
        tauxAssurance,
        tauxPlateforme,
        tauxSupportAdmin,
        tauxSupportOp,
        tauxAccountManager,
        remiseCaSeuil,
        tauxRemiseCa,
        tauxRemiseHof,
        minFacturationPlateforme,
        minFacturationSupportOp,
        minFacturationAccountManager,
      },
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <ServicesFm4allMobilePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
      total={total}
    />
  ) : (
    <ServicesFm4allDesktopPropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
      total={total}
    />
  );
};

export default ServicesFm4AllPropositions;
