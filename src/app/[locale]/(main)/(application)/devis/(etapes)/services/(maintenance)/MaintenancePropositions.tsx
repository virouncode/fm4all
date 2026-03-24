import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { gammes } from "@/zod-schemas/gamme.schema";
import { SelectLegioTarifsType } from "@/zod-schemas/legioTarifs.schema";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites.schema";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs.schema";
import { SelectQ18TarifsType } from "@/zod-schemas/q18Tarifs.schema";
import { SelectQualiteAirTarifsType } from "@/zod-schemas/qualiteAirTarifs.schema";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import MaintenanceDesktopPropositions from "./(desktop)/MaintenanceDesktopPropositions";
import MaintenanceMobilePropositions from "./(mobile)/MaintenanceMobilePropositions";

type MaintenancePropositionsProps = {
  maintenanceQuantites: SelectMaintenanceQuantitesType[];
  maintenanceTarifs: SelectMaintenanceTarifsType[];
  q18Tarifs: SelectQ18TarifsType[];
  legioTarifs: SelectLegioTarifsType[];
  qualiteAirTarifs: SelectQualiteAirTarifsType[];
};

const MaintenancePropositions = ({
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarifs,
  legioTarifs,
  qualiteAirTarifs,
}: MaintenancePropositionsProps) => {
  const { maintenance, setMaintenance } = useMaintenanceStore(
    useShallow((s) => ({
      maintenance: s.maintenance,
      setMaintenance: s.setMaintenance,
    })),
  );
  //Calcul des propositions
  const propositions = maintenanceTarifs.map((tarif) => {
    const {
      id,
      gamme,
      nomPrestataire,
      slogan: sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifPrestataire,
      nbClients,
      noteGoogle,
      nbAvis,
      entrepriseId,
      hParPassage,
      tauxHoraire,
      imageStorageKey,
      infos,
    } = tarif;
    const freqAnnuelle =
      maintenanceQuantites.find((quantite) => quantite.gamme === tarif.gamme)
        ?.freqAnnuelle ?? null;
    const totalAnnuelService =
      freqAnnuelle !== null ? hParPassage * tauxHoraire * freqAnnuelle : null;
    const totalAnnuelQ18 =
      q18Tarifs.find((item) => item.entrepriseId === entrepriseId)
        ?.prixAnnuel ?? null;
    const totalAnnuelLegio =
      legioTarifs.find((item) => item.entrepriseId === entrepriseId)
        ?.prixAnnuel ?? null;
    const totalAnnuelQualiteAir =
      qualiteAirTarifs.find((item) => item.entrepriseId === entrepriseId)
        ?.prixAnnuel ?? null;

    const totalAnnuelControlesSupplementaires =
      gamme === "essentiel"
        ? totalAnnuelQ18
        : gamme === "confort"
          ? (totalAnnuelQ18 ?? 0) + (totalAnnuelLegio ?? 0)
          : (totalAnnuelQ18 ?? 0) +
            (totalAnnuelLegio ?? 0) +
            (totalAnnuelQualiteAir ?? 0);
    const totalAnnuel = totalAnnuelService
      ? totalAnnuelService + (totalAnnuelControlesSupplementaires ?? 0)
      : null;
    return {
      id,
      gamme,
      nomPrestataire,
      entrepriseId,
      sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifPrestataire,
      nbClients,
      noteGoogle,
      nbAvis,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      totalAnnuelService,
      totalAnnuelQ18,
      totalAnnuelLegio,
      totalAnnuelQualiteAir,
      totalAnnuel,
      imageStorageKey,
      infos,
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      string,
      {
        id: string;
        gamme: "essentiel" | "confort" | "excellence";
        nomPrestataire: string;
        entrepriseId: string;
        sloganPrestataire: string | null;
        logoStorageKey: string | null;
        anneeCreation: number | null;
        ca: string | null;
        effectifPrestataire: string | null;
        nbClients: number | null;
        noteGoogle: string | null;
        nbAvis: number | null;
        hParPassage: number;
        tauxHoraire: number;
        freqAnnuelle: number | null;
        totalAnnuelService: number | null;
        totalAnnuelQ18: number | null;
        totalAnnuelLegio: number | null;
        totalAnnuelQualiteAir: number | null;
        totalAnnuel: number | null;
        imageStorageKey: string | null;
        infos: string | null;
      }[]
    >
  >((acc, item) => {
    const { entrepriseId } = item;
    if (!acc[entrepriseId]) {
      acc[entrepriseId] = [];
    }
    // Add the item to the appropriate array
    acc[entrepriseId].push(item);
    acc[entrepriseId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme),
    );
    return acc;
  }, {});

  //An array of arrays of propositions by entrepriseId
  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
    imageStorageKey: string | null;
    infos: string | null;
  }) => {
    const {
      gamme,
      nomPrestataire,
      entrepriseId,
      sloganPrestataire,
      logoStorageKey,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      totalAnnuelQ18,
      totalAnnuelLegio,
      totalAnnuelQualiteAir,
    } = proposition;

    if (
      maintenance.infos.entrepriseId === entrepriseId &&
      maintenance.infos.gammeSelected === gamme
    ) {
      {
        setMaintenance((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            entrepriseId: null,
            nomPrestataire: null,
            sloganPrestataire: null,
            logoStorageKey: null,
            gammeSelected: null,
          },
          quantites: {
            freqAnnuelle: null,
            hParPassage: null,
          },
          prix: {
            tauxHoraire: null,
            prixQ18: null,
            prixLegio: null,
            prixQualiteAir: null,
          },
        }));
        return;
      }
    }
    setMaintenance((prev) => ({
      infos: {
        ...prev.infos,
        entrepriseId,
        nomPrestataire,
        sloganPrestataire,
        logoStorageKey,
        gammeSelected: gamme,
      },
      quantites: {
        freqAnnuelle,
        hParPassage,
      },
      prix: {
        tauxHoraire,
        prixQ18: totalAnnuelQ18,
        prixLegio: totalAnnuelLegio,
        prixQualiteAir: totalAnnuelQualiteAir,
      },
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <MaintenanceMobilePropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <MaintenanceDesktopPropositions
      formattedPropositions={formattedPropositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default MaintenancePropositions;
