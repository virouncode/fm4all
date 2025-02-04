import { TypesEauType } from "@/constants/typesEau";
import { TypesPoseType } from "@/constants/typesPose";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import {
  FontainesContext,
  MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE,
} from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { toast } from "@/hooks/use-toast";
import { roundNbPersonnesFontaine } from "@/lib/roundNbPersonnesFontaine";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import AddEspaceButton from "../(cafe)/AddEspaceButton";
import NextEspaceButton from "../(cafe)/NextEspaceButton";
import NextServiceButton from "../../../NextServiceButton";
import FontaineEspacePropositionCard from "./FontaineEspacePropositionCard";
import FontaineEspacePropositionFournisseurLogo from "./FontaineEspacePropositionFournisseurLogo";

type FontaineEspacePropositionsProps = {
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
  espace: FontaineEspaceType;
};

const FontaineEspacePropositions = ({
  fontainesModeles,
  fontainesTarifs,
  espace,
}: FontaineEspacePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { setFoodBeverage } = useContext(FoodBeverageContext);
  const { setDevisProgress } = useContext(DevisProgressContext);
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const router = useRouter();
  //Calcul des propositions
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId
  );
  const effectif = client.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ||
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      : effectif);
  const tarifs = fontainesTarifs.filter(
    (tarif) =>
      tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
      tarif.type === espace.infos.typeBoissons &&
      tarif.typePose === espace.infos.typePose
  );

  const fournisseursCompatiblesIds = tarifs
    ?.filter((tarif) => tarif[fontaines.infos.dureeLocation] !== null)
    .map(({ fournisseurId }) => fournisseurId);

  if (
    fontaines.infos.fournisseurId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId &&
    !fournisseursCompatiblesIds.includes(fontaines.infos.fournisseurId)
  ) {
    return (
      <div className="flex-1 flex items-center justify-center border rounded-xl">
        <p className="max-w-prose text-center text-base">
          Le fournisseur choisi précédemment ne propose pas d&apos;offre pour
          ces critères, veuillez changer le type de boissons, le type de pose ou
          le nombre de personnes.
        </p>
      </div>
    );
  }

  const fournisseursIds =
    fontaines.infos.fournisseurId &&
    fontainesEspacesIds[0] !== espace.infos.espaceId
      ? [fontaines.infos.fournisseurId] //1 seul fournisseur
      : tarifs?.map(({ fournisseurId }) => fournisseurId); //tous les fournisseurs

  const propositions = fournisseursIds.map((fournisseurId) => {
    const tarifsFournisseur = tarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    const prixLoc = tarifsFournisseur?.[fontaines.infos.dureeLocation] ?? null;
    const prixInstal = tarifsFournisseur?.fraisInstallation ?? null;
    const prixMaintenance = tarifsFournisseur?.paMaintenance ?? null;
    const prixUnitaireConsoFiltres = tarifsFournisseur?.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = tarifsFournisseur?.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      tarifsFournisseur?.paConsoEauChaude ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalConso =
      nbPersonnes *
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0));
    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;
    const modele = tarifsFournisseur?.fontaineId
      ? fontainesModeles.find(
          (modele) => modele.id === tarifsFournisseur?.fontaineId
        )?.modele ?? null
      : null;
    const marque = tarifsFournisseur?.fontaineId
      ? fontainesModeles.find(
          (modele) => modele.id === tarifsFournisseur?.fontaineId
        )?.marque ?? null
      : null;
    return {
      id: tarifsFournisseur?.id as number,
      fournisseurId,
      nomFournisseur: tarifsFournisseur?.nomFournisseur ?? null,
      sloganFournisseur: tarifsFournisseur?.sloganFournisseur ?? null,
      modele,
      marque,
      infos: tarifsFournisseur?.infos ?? null,
      reconditionne: tarifsFournisseur?.reconditionne ?? null,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoFiltres,
      prixUnitaireConsoCO2,
      prixUnitaireConsoEauChaude,
      totalAnnuel,
      totalInstallation,
    };
  });

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string | null;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      fournisseurId,
      modele,
      marque,
      reconditionne,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoFiltres,
      prixUnitaireConsoCO2,
      prixUnitaireConsoEauChaude,
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //Je décoche
    if (
      espace.infos.selected &&
      fontaines.infos.fournisseurId === fournisseurId
    ) {
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  selected: false,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                prix: {
                  prixLoc: null,
                  prixInstal: null,
                  prixMaintenance: null,
                  prixUnitaireConsoFiltres: null,
                  prixUnitaireConsoCO2: null,
                  prixUnitaireConsoEauChaude: null,
                },
              }
            : item
        ),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: null,
                totalInstallation: null,
              }
            : item
        ),
      }));
    } else {
      //Je coche
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  selected: true,
                  marque,
                  modele,
                  reconditionne,
                },
                prix: {
                  prixLoc,
                  prixInstal,
                  prixMaintenance,
                  prixUnitaireConsoFiltres,
                  prixUnitaireConsoCO2,
                  prixUnitaireConsoEauChaude,
                },
              }
            : item
        ),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation,
              }
            : item
        ),
      }));
    }
  };

  const handleClickFirstEspaceProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string | null;
    sloganFournisseur: string | null;
    modele: string | null;
    marque: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      modele,
      marque,
      reconditionne,
      prixLoc,
      prixInstal,
      prixMaintenance,
      prixUnitaireConsoFiltres,
      prixUnitaireConsoCO2,
      prixUnitaireConsoEauChaude,
      totalAnnuel,
      totalInstallation,
    } = proposition;
    //======================= JE DECOCHE ======================//
    if (
      espace.infos.selected &&
      fontaines.infos.fournisseurId === fournisseurId
    ) {
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
        },
        espaces: prev.espaces.map((item) => ({
          ...item,
          infos: {
            ...item.infos,
            selected:
              item.infos.espaceId === espace.infos.espaceId
                ? false
                : item.infos.selected,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoFiltres: null,
            prixUnitaireConsoCO2: null,
            prixUnitaireConsoEauChaude: null,
          },
        })),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) => ({
          ...item,
          total: null,
          totalInstallation: null,
        })),
      }));
    } else {
      //======================== JE COCHE ======================//
      //Pour chaque espace et le the si gammeCafeSelected je mets à jour les prix et le total
      const newFontainesInfos = {
        ...fontaines.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
      };
      const newEspace: FontaineEspaceType[] = [];
      const newTotalEspace: {
        espaceId: number;
        total: number | null;
        totalInstallation: number | null;
      }[] = [];
      fontaines.espaces.forEach((item) => {
        if (item.infos.espaceId === espace.infos.espaceId) {
          //1ER LOT
          newEspace.push({
            ...item,
            infos: {
              ...item.infos,
              selected: true,
              marque,
              modele,
              reconditionne,
            },
            prix: {
              prixLoc,
              prixInstal,
              prixMaintenance,
              prixUnitaireConsoFiltres,
              prixUnitaireConsoCO2,
              prixUnitaireConsoEauChaude,
            },
          });
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: totalAnnuel,
            totalInstallation: totalInstallation,
          });
          return;
        }
        //AUTRES LOTS
        if (!item.infos.selected) {
          //pas de selection
          newEspace.push(item);
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: null,
            totalInstallation: null,
          });
          return;
        }
        //selection existante je recalcule tout
        const itemNbPersonnes =
          item.quantites.nbPersonnes ||
          (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
            : effectif);
        const itemMachinesTarifFournisseur = fontainesTarifs.find(
          (tarif) =>
            tarif.nbPersonnes === roundNbPersonnesFontaine(itemNbPersonnes) &&
            tarif.type === item.infos.typeBoissons &&
            tarif.typePose === item.infos.typePose &&
            tarif[fontaines.infos.dureeLocation] !== null &&
            tarif.fournisseurId === fournisseurId
        );
        if (!itemMachinesTarifFournisseur) {
          newEspace.push(item);
          newTotalEspace.push({
            espaceId: item.infos.espaceId,
            total: null,
            totalInstallation: null,
          });
          return;
        }

        const itemPrixLoc =
          itemMachinesTarifFournisseur?.[fontaines.infos.dureeLocation] ?? null;
        const itemPrixInstal =
          itemMachinesTarifFournisseur?.fraisInstallation ?? null;
        const itemTotalInstallation =
          itemPrixInstal !== null ? itemPrixInstal : null;
        const itemPrixMaintenance =
          itemMachinesTarifFournisseur?.paMaintenance ?? null;

        const itemPrixUnitaireConsoFiltres =
          itemMachinesTarifFournisseur?.paConsoFiltres ?? null;
        const itemPrixUnitaireConsoCO2 =
          itemMachinesTarifFournisseur?.paConsoCO2 ?? null;
        const itemPrixUnitaireConsoEauChaude =
          itemMachinesTarifFournisseur?.paConsoEauChaude ?? null;

        const itemTotalLoc =
          itemPrixLoc !== null && itemPrixMaintenance !== null
            ? itemPrixLoc + itemPrixMaintenance
            : null;
        const itemTotalConso =
          ((itemPrixUnitaireConsoFiltres ?? 0) +
            (itemPrixUnitaireConsoCO2 ?? 0) +
            (itemPrixUnitaireConsoEauChaude ?? 0)) *
          itemNbPersonnes;

        const itemTotalAnnuel =
          itemTotalLoc !== null ? itemTotalLoc + itemTotalConso : null;
        const itemModele = itemMachinesTarifFournisseur
          ? fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId
            )?.modele ?? null
          : null;
        const itemMarque = itemMachinesTarifFournisseur
          ? fontainesModeles?.find(
              ({ id }) => id === itemMachinesTarifFournisseur?.fontaineId
            )?.marque ?? null
          : null;
        const itemReconditionne = itemMachinesTarifFournisseur
          ? itemMachinesTarifFournisseur.reconditionne ?? null
          : null;
        newEspace.push({
          ...item,
          infos: {
            ...item.infos,
            marque: itemMarque,
            modele: itemModele,
            reconditionne: itemReconditionne,
          },
          prix: {
            prixLoc: itemPrixLoc,
            prixInstal: itemPrixInstal,
            prixMaintenance: itemPrixMaintenance,
            prixUnitaireConsoFiltres: itemPrixUnitaireConsoFiltres,
            prixUnitaireConsoCO2: itemPrixUnitaireConsoCO2,
            prixUnitaireConsoEauChaude: itemPrixUnitaireConsoEauChaude,
          },
        });
        newTotalEspace.push({
          espaceId: item.infos.espaceId,
          total: itemTotalAnnuel,
          totalInstallation: itemTotalInstallation,
        });
      });
      setFontaines((prev) => ({
        ...prev,
        infos: newFontainesInfos,
        espaces: newEspace,
      }));
      setTotalFontaines({
        totalEspaces: newTotalEspace,
      });
    }
  };

  const handleAddEspace = () => {
    setFontaines((prev) => ({
      infos: {
        ...prev.infos,
        currentEspaceId:
          prev.espaces[prev.espaces.length - 1].infos.espaceId + 1,
      },
      nbEspaces: (prev.nbEspaces ?? 0) + 1,
      espaces: [
        ...prev.espaces,
        {
          infos: {
            espaceId: prev.espaces[prev.espaces.length - 1].infos.espaceId + 1,
            typeBoissons: "EF" as TypesEauType,
            typePose: "aposer" as TypesPoseType,
            selected: false,
            marque: null,
            modele: null,
            reconditionne: false,
          },
          quantites: {
            nbPersonnes:
              effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                : effectif,
          },
          prix: {
            prixLoc: null,
            prixInstal: null,
            prixMaintenance: null,
            prixUnitaireConsoFiltres: null,
            prixUnitaireConsoCO2: null,
            prixUnitaireConsoEauChaude: null,
          },
        },
      ].sort((a, b) => a.infos.espaceId - b.infos.espaceId),
    }));
    setTotalFontaines((prev) => ({
      totalEspaces: [
        ...prev.totalEspaces,
        {
          espaceId:
            prev.totalEspaces[prev.totalEspaces.length - 1].espaceId + 1,
          total: 0,
          totalInstallation: 0,
        },
      ],
    }));
  };

  const handleAlert = () => {
    if (!espace.infos.selected) {
      toast({
        description:
          "Veuillez d'abord sélectionner une offre ou retirer tous les espaces",
        duration: 3000,
        variant: "destructive",
        className: "left-0",
      });
      return;
    }
  };

  const handleClickNextEspace = () => {
    const indexOfCurrentEspace = fontainesEspacesIds.indexOf(
      espace.infos.espaceId
    );
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        currentEspaceId: fontainesEspacesIds[indexOfCurrentEspace + 1],
      },
    }));
  };

  const handleClickNext = () => {
    setFoodBeverage((prev) => ({
      ...prev,
      currentFoodBeverageId: 1,
    }));
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    setDevisProgress({ currentStep: 4, completedSteps: [1, 2, 3] });
    router.push(`/mon-devis/pilotage-prestations?${searchParams.toString()}`);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
        {propositions.map((proposition) => (
          <div className="flex border-b flex-1" key={proposition.fournisseurId}>
            <FontaineEspacePropositionFournisseurLogo {...proposition} />
            <FontaineEspacePropositionCard
              proposition={proposition}
              handleClickProposition={handleClickProposition}
              handleClickFirstEspaceProposition={
                handleClickFirstEspaceProposition
              }
              espace={espace}
              fontainesEspacesIds={fontainesEspacesIds}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {fontainesEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
          <div className="flex justify-end gap-4 items-center">
            {espace.infos.selected ? (
              <AddEspaceButton
                handleAddEspace={handleAddEspace}
                title="fontaine"
              />
            ) : null}
            <NextServiceButton handleClickNext={handleClickNext} />
          </div>
        ) : (
          <div className="ml-auto" onClick={handleAlert}>
            <NextEspaceButton
              disabled={espace.infos.selected ? false : true}
              handleClickNextEspace={handleClickNextEspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FontaineEspacePropositions;
