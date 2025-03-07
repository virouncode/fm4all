import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { gammes } from "@/zod-schemas/gamme";
import { SelectLegioTarifsType } from "@/zod-schemas/legioTarifs";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { SelectQ18TarifsType } from "@/zod-schemas/q18Tarifs";
import { SelectQualiteAirTarifsType } from "@/zod-schemas/qualiteAirTarifs";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
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
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);

  //Calcul des propositions
  const propositions = maintenanceTarifs.map((tarif) => {
    const {
      id,
      gamme,
      nomFournisseur,
      slogan: sloganFournisseur,
      logoUrl,
      locationUrl,
      anneeCreation,
      ca,
      effectif: effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      fournisseurId,
      hParPassage,
      tauxHoraire,
    } = tarif;
    const freqAnnuelle =
      maintenanceQuantites.find((quantite) => quantite.gamme === tarif.gamme)
        ?.freqAnnuelle ?? null;
    const totalAnnuelService =
      freqAnnuelle !== null ? hParPassage * tauxHoraire * freqAnnuelle : null;
    const totalAnnuelQ18 =
      q18Tarifs.find((item) => item.fournisseurId === fournisseurId)
        ?.prixAnnuel ?? null;
    const totalAnnuelLegio =
      legioTarifs.find((item) => item.fournisseurId === fournisseurId)
        ?.prixAnnuel ?? null;
    const totalAnnuelQualiteAir =
      qualiteAirTarifs.find((item) => item.fournisseurId === fournisseurId)
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
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
      logoUrl,
      locationUrl,
      anneeCreation,
      ca,
      effectifFournisseur,
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
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      number,
      {
        id: number;
        gamme: "essentiel" | "confort" | "excellence";
        nomFournisseur: string;
        fournisseurId: number;
        sloganFournisseur: string | null;
        logoUrl: string | null;
        locationUrl: string | null;
        anneeCreation: number | null;
        ca: string | null;
        effectifFournisseur: string | null;
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
      }[]
    >
  >((acc, item) => {
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme)
    );
    return acc;
  }, {});

  //An array of arrays of propositions by fournisseurId
  const formattedPropositions = Object.values(propositionsByFournisseurId);

  const handleClickProposition = (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
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
  }) => {
    const {
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
      logoUrl,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      totalAnnuelService,
      totalAnnuelQ18,
      totalAnnuelLegio,
      totalAnnuelQualiteAir,
    } = proposition;

    const totalQ18 = totalAnnuelQ18;
    const totalLegio = gammes.indexOf(gamme) > 0 ? totalAnnuelLegio : null;
    const totalQualiteAir =
      gammes.indexOf(gamme) > 1 ? totalAnnuelQualiteAir : null;

    if (
      maintenance.infos.fournisseurId === fournisseurId &&
      maintenance.infos.gammeSelected === gamme
    ) {
      {
        setMaintenance((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            logoUrl: null,
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
        setTotalMaintenance({
          totalService: null,
          totalQ18: null,
          totalLegio: null,
          totalQualiteAir: null,
        });
        return;
      }
    }
    setMaintenance((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        logoUrl,
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
    setTotalMaintenance({
      totalService: totalAnnuelService,
      totalQ18,
      totalLegio,
      totalQualiteAir,
    });
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
