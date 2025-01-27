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
    const prixAnnuelService =
      freqAnnuelle !== null
        ? Math.round(hParPassage * tauxHoraire * freqAnnuelle)
        : null;
    const prixAnnuelQ18 = q18Tarif.prixAnnuel;
    const prixAnnuelLegio = legioTarif.prixAnnuel;
    const prixAnnuelQualiteAir = qualiteAirTarif.prixAnnuel;

    const prixAnnuelControlesSupplementaires =
      gamme === "essentiel"
        ? prixAnnuelQ18
        : gamme === "confort"
        ? prixAnnuelQ18 + prixAnnuelLegio
        : prixAnnuelQ18 + prixAnnuelLegio + prixAnnuelQualiteAir;
    const total = prixAnnuelService
      ? prixAnnuelService + prixAnnuelControlesSupplementaires
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
      prixAnnuelService,
      prixAnnuelQ18,
      prixAnnuelLegio,
      prixAnnuelQualiteAir,
      total,
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
        prixAnnuelService: number | null;
        prixAnnuelQ18: number;
        prixAnnuelLegio: number;
        prixAnnuelQualiteAir: number;
        total: number | null;
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
    prixAnnuelService: number | null;
    prixAnnuelQ18: number;
    prixAnnuelLegio: number;
    prixAnnuelQualiteAir: number;
    total: number | null;
  }) => {
    const {
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      prixAnnuelService,
      prixAnnuelQ18,
      prixAnnuelLegio,
      prixAnnuelQualiteAir,
    } = proposition;

    const totalQ18 = prixAnnuelQ18;
    const totalLegio = gammes.indexOf(gamme) > 0 ? prixAnnuelLegio : null;
    const totalQualiteAir =
      gammes.indexOf(gamme) > 1 ? prixAnnuelQualiteAir : null;

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
        prixQ18: prixAnnuelQ18,
        prixLegio: prixAnnuelLegio,
        prixQualiteAir: prixAnnuelQualiteAir,
      },
    }));
    setTotalMaintenance({
      totalService: prixAnnuelService,
      totalQ18,
      totalLegio,
      totalQualiteAir,
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
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
