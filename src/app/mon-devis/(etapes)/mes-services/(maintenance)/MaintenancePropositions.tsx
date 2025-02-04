import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { gammes, GammeType } from "@/zod-schemas/gamme";
import { SelectLegioTarifsType } from "@/zod-schemas/legioTarifs";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { SelectQ18TarifsType } from "@/zod-schemas/q18Tarifs";
import { SelectQualiteAirTarifsType } from "@/zod-schemas/qualiteAirTarifs";
import { useContext } from "react";
import MaintenanceFournisseurLogo from "./MaintenanceFournisseurLogo";
import MaintenancePropositionCard from "./MaintenancePropositionCard";

type MaintenancePropositionsProps = {
  maintenanceQuantites: SelectMaintenanceQuantitesType[];
  maintenanceTarifs: SelectMaintenanceTarifsType[];
  q18Tarif: SelectQ18TarifsType;
  legioTarif: SelectLegioTarifsType;
  qualiteAirTarif: SelectQualiteAirTarifsType;
};

const MaintenancePropositions = ({
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarif,
  legioTarif,
  qualiteAirTarif,
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
      fournisseurId,
      hParPassage,
      tauxHoraire,
    } = tarif;
    const freqAnnuelle =
      maintenanceQuantites.find((quantite) => quantite.gamme === tarif.gamme)
        ?.freqAnnuelle ?? null;
    const totalAnnuelService =
      freqAnnuelle !== null
        ? Math.round(hParPassage * tauxHoraire * freqAnnuelle)
        : null;
    const totalAnnuelQ18 = q18Tarif.prixAnnuel;
    const totalAnnuelLegio = legioTarif.prixAnnuel;
    const totalAnnuelQualiteAir = qualiteAirTarif.prixAnnuel;

    const totalAnnuelControlesSupplementaires =
      gamme === "essentiel"
        ? totalAnnuelQ18
        : gamme === "confort"
        ? totalAnnuelQ18 + totalAnnuelLegio
        : totalAnnuelQ18 + totalAnnuelLegio + totalAnnuelQualiteAir;
    const totalAnnuel = totalAnnuelService
      ? totalAnnuelService + totalAnnuelControlesSupplementaires
      : null;
    return {
      id,
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
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
        gamme: GammeType;
        nomFournisseur: string;
        fournisseurId: number;
        sloganFournisseur: string | null;
        hParPassage: number;
        tauxHoraire: number;
        freqAnnuelle: number | null;
        totalAnnuelService: number | null;
        totalAnnuelQ18: number;
        totalAnnuelLegio: number;
        totalAnnuelQualiteAir: number;
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
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number;
    totalAnnuelLegio: number;
    totalAnnuelQualiteAir: number;
    totalAnnuel: number | null;
  }) => {
    const {
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
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

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <MaintenanceFournisseurLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <MaintenancePropositionCard
                  key={proposition.id}
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

export default MaintenancePropositions;
