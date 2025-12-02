import { MARGE } from "@/constants/constants";
import { useOfficeManagerStore } from "@/stores/officeManagerStore";
import { useServicesFm4AllStore } from "@/stores/servicesFm4AllStore";
import { useTotalCafeStore } from "@/stores/totalCafeStore";
import { useTotalFontainesStore } from "@/stores/totalFontainesStore";
import { useTotalHygieneStore } from "@/stores/totalHygieneStore";
import { useTotalIncendieStore } from "@/stores/totalIncendieStore";
import { useTotalMaintenanceStore } from "@/stores/totalMaintenanceStore";
import { useTotalNettoyageStore } from "@/stores/totalNettoyageStore";
import { useTotalOfficeManagerStore } from "@/stores/totalOfficeManagerStore";
import { useTotalServicesFm4AllStore } from "@/stores/totalServicesFm4AllStore";
import { useTotalSnacksFruitsStore } from "@/stores/totalSnacksFruitsStore";
import { useTotalTheStore } from "@/stores/totalTheStore";
import { GammeType } from "@/zod-schemas/gamme";
import { ServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4All";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux";
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
  const setTotalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.setTotalServicesFm4All,
  );
  const totalNettoyage = useTotalNettoyageStore((s) => s.totalNettoyage);
  const totalHygiene = useTotalHygieneStore((s) => s.totalHygiene);
  const totalMaintenance = useTotalMaintenanceStore((s) => s.totalMaintenance);
  const totalIncendie = useTotalIncendieStore((s) => s.totalIncendie);
  const totalCafe = useTotalCafeStore((s) => s.totalCafe);
  const totalThe = useTotalTheStore((s) => s.totalThe);
  const totalSnacksFruits = useTotalSnacksFruitsStore(
    (s) => s.totalSnacksFruits,
  );
  const totalFontaines = useTotalFontainesStore((s) => s.totalFontaines);
  const totalOfficeManager = useTotalOfficeManagerStore(
    (s) => s.totalOfficeManager,
  );
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
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
  const totalFinalNettoyage = Object.values(totalNettoyage)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalHygiene = Object.values(totalHygiene)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalMaintenance = Object.values(totalMaintenance)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalIncendie = Object.values(totalIncendie)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  //TODO voir pour les prix one shot d'installation
  const totalFinalCafe = totalCafe.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalFinalThe = totalThe.totalService ?? 0;
  const totalFinalSnacksFruits = totalSnacksFruits.total ?? 0;
  const totalFinalFontaines = totalFontaines.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalFinalOfficeManager = totalOfficeManager.totalService ?? 0;
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
    id: number;
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
