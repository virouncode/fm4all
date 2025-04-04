"use client";

import {
  MAX_NB_PERSONNES_PAR_ESPACE,
  RATIO_CHOCO,
  RATIO_LAIT,
  RATIO_SUCRE,
} from "@/constants/constants";
import { TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { toast } from "@/hooks/use-toast";
import { roundNbPersonnesCafeConso } from "@/lib/roundNbPersonnesCafeConso";
import { roundNbPersonnesCafeMachines } from "@/lib/roundNbPersonnesCafeMachines";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectChocolatConsoTarifsType } from "@/zod-schemas/chocolatConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { SelectSucreConsoTarifsType } from "@/zod-schemas/sucreConsoTarifs";
import { useTranslations } from "next-intl";
import { ChangeEvent, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import CafeDesktopEspaceInputs from "./(desktop)/CafeDesktopEspaceInputs";
import CafeMobileEspaceInputs from "./(mobile)/CafeMobileEspaceInputs";

type CafeEspaceFormProps = {
  espace: CafeEspaceType;
  cafeMachines: SelectCafeMachinesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocolatConsoTarifs: SelectChocolatConsoTarifsType[];
  sucreConsoTarifs: SelectSucreConsoTarifsType[];
};

const CafeEspaceForm = ({
  espace,
  cafeMachines,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocolatConsoTarifs,
  sucreConsoTarifs,
}: CafeEspaceFormProps) => {
  const t = useTranslations("DevisPage");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const cafeEspacesIds = cafe.espaces.map((espace) => espace.infos.espaceId);
  const effectif = client.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ??
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE
      ? MAX_NB_PERSONNES_PAR_ESPACE
      : effectif);

  const nbTassesParAn = nbPersonnes * 400;
  // const nbPersonnesTotal = cafe.espaces.reduce(
  //   (acc, curr) =>
  //     acc +
  //     (curr.quantites.nbPersonnes ||
  //       (effectif > MAX_NB_PERSONNES_PAR_ESPACE
  //         ? MAX_NB_PERSONNES_PAR_ESPACE
  //         : effectif)),
  //   0
  // );

  //Je change le type de boissons
  //Si c'est la première machine :
  //Pour la première machine et les autres : Je ne change pas de fournisseur ni de gamme, je mets juste le total à jour

  const handleChangeTypeBoissons = (value: string) => {
    //JE N'AI PAS DE FOURNISSEUR
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  typeBoissons: value as TypesBoissonsType,
                },
              }
            : item
        ),
      }));
      return;
    }
    //J'ai un fournisseur, je dois mettre à jour les prix et les caractéristiques de la machine
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesCafeMachines(nbPersonnes) &&
        tarif.type === value &&
        tarif.fournisseurId === cafe.infos.fournisseurId &&
        tarif[cafe.infos.dureeLocation] !== null
    ); //1 ligne par fournisseur
    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            logoUrl: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    typeBoissons: value as TypesBoissonsType,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    ...item.quantites,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : {
                  ...item,
                  infos: {
                    ...item.infos,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
          ),
        }));
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: null,
          },
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
        setTotalThe({
          totalService: null,
        });
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setCafe((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    typeBoissons: value as TypesBoissonsType,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantite: {
                    ...item.quantites,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
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
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
    const prixLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixInstal = machinesTarifFournisseur.fraisInstallation;
    const prixMaintenance = machinesTarifFournisseur.paMaintenance;
    const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;

    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === espace.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const consoLaitTarifFournisseur = laitConsoTarifs.find(
      (item) =>
        item.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        item.fournisseurId === cafe.infos.fournisseurId
    );
    const typeLait =
      value !== "cafe" ? machinesTarifFournisseur?.typeLait : null;
    const prixUnitaireConsoLait =
      typeLait === "dosettes"
        ? (consoLaitTarifFournisseur?.prixUnitaireDosette ?? null)
        : typeLait === "frais"
          ? (consoLaitTarifFournisseur?.prixUnitaireFrais ?? null)
          : typeLait === "poudre"
            ? (consoLaitTarifFournisseur?.prixUnitairePoudre ?? null)
            : null;

    const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const typeChocolat =
      value === "chocolat" ? machinesTarifFournisseur?.typeChocolat : null;
    const prixUnitaireConsoChocolat =
      typeChocolat === "sachets"
        ? (consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null)
        : typeChocolat === "poudre"
          ? (consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null)
          : null;

    const consoSucreTarifFournisseur = sucreConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const prixUnitaireConsoSucre =
      consoSucreTarifFournisseur?.prixUnitaire ?? null;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * nbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * nbTassesParAn * RATIO_SUCRE +
      (value !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * nbTassesParAn * RATIO_LAIT
        : 0) +
      (value === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * nbTassesParAn * RATIO_CHOCO
        : 0);
    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.modele ?? null)
      : null;
    const marque = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.marque ?? null)
      : null;
    const reconditionne = machinesTarifFournisseur
      ? (machinesTarifFournisseur.reconditionne ?? null)
      : null;
    //Je mets à jour mon espace
    setCafe((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                typeBoissons: value as TypesBoissonsType,
                marque,
                modele,
                reconditionne,
              },
              quantites: {
                ...item.quantites,
                nbPassagesParAn,
                nbMachines,
              },
              prix: {
                prixLoc,
                prixInstal,
                prixMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
                prixUnitaireConsoSucre,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation: totalInstallation,
              }
            : item
        ),
      }));
    }
  };

  const updateCafeEspace = (newNbPersonnes: number) => {
    // const newNbPersonnesTotal = cafe.espaces.reduce(
    //   (acc, curr) =>
    //     acc + curr.infos.espaceId === espace.infos.espaceId
    //       ? newNbPersonnes
    //       : curr.quantites.nbPersonnes ||
    //         (effectif > MAX_NB_PERSONNES_PAR_ESPACE
    //           ? MAX_NB_PERSONNES_PAR_ESPACE
    //           : effectif),
    //   0
    // );
    const newNbTassesParAn = newNbPersonnes * 400;
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                quantites: {
                  ...item.quantites,
                  nbPersonnes: newNbPersonnes,
                },
              }
            : item
        ),
      }));
      return;
    }
    //Si j'avais deja un fournisseur
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesCafeMachines(newNbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.fournisseurId === cafe.infos.fournisseurId &&
        tarif[cafe.infos.dureeLocation] !== null
    );

    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            logoUrl: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : {
                  ...item,
                  infos: {
                    ...item.infos,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
          ),
        }));
        setThe((prev) => ({
          ...prev,
          prix: {
            prixUnitaire: null,
          },
        }));
        setTotalCafe((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
        setTotalThe({
          totalService: null,
        });
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setCafe((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    gammeCafeSelected: null,
                    marque: null,
                    modele: null,
                    reconditionne: false,
                  },
                  quantites: {
                    nbPersonnes: newNbPersonnes,
                    nbMachines: null,
                    nbPassagesParAn: null,
                  },
                  prix: {
                    prixLoc: null,
                    prixInstal: null,
                    prixMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                    prixUnitaireConsoSucre: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
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
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
    const prixLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixInstal = machinesTarifFournisseur.fraisInstallation;
    const prixMaintenance = machinesTarifFournisseur.paMaintenance;
    const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundNbPersonnesCafeConso(newNbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === espace.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const consoLaitTarifFournisseur = laitConsoTarifs.find(
      (item) =>
        item.effectif === roundNbPersonnesCafeConso(newNbPersonnes) &&
        item.fournisseurId === cafe.infos.fournisseurId
    );
    const typeLait =
      espace.infos.typeBoissons === "lait"
        ? machinesTarifFournisseur?.typeLait
        : null;
    const prixUnitaireConsoLait =
      typeLait === "dosettes"
        ? (consoLaitTarifFournisseur?.prixUnitaireDosette ?? null)
        : typeLait === "frais"
          ? (consoLaitTarifFournisseur?.prixUnitaireFrais ?? null)
          : typeLait === "poudre"
            ? (consoLaitTarifFournisseur?.prixUnitairePoudre ?? null)
            : null;

    const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const typeChocolat =
      espace.infos.typeBoissons === "chocolat"
        ? machinesTarifFournisseur?.typeChocolat
        : null;
    const prixUnitaireConsoChocolat =
      typeChocolat === "sachets"
        ? (consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null)
        : typeChocolat === "poudre"
          ? (consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null)
          : null;

    const consoSucreTarifFournisseur = sucreConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(newNbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const prixUnitaireConsoSucre =
      consoSucreTarifFournisseur?.prixUnitaire ?? null;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * newNbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * newNbTassesParAn * RATIO_SUCRE +
      (espace.infos.typeBoissons !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * newNbTassesParAn * RATIO_LAIT
        : 0) +
      (espace.infos.typeBoissons === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * newNbTassesParAn * RATIO_CHOCO
        : 0);
    const totalAnnuel =
      newNbPersonnes && totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.modele ?? null)
      : null;
    const marque = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.marque ?? null)
      : null;
    const reconditionne = machinesTarifFournisseur
      ? (machinesTarifFournisseur.reconditionne ?? null)
      : null;

    //Je mets à jour  ma machine
    setCafe((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                marque,
                modele,
                reconditionne,
              },
              quantites: {
                ...item.quantites,
                nbPersonnes: newNbPersonnes,
                nbMachines,
                nbPassagesParAn,
              },
              prix: {
                prixLoc,
                prixInstal,
                prixMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
                prixUnitaireConsoSucre,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
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

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : 0;
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE;
      toast({
        title: t("limite-atteinte"),
        description: tCafe(
          "le-nombre-de-personnes-par-espace-cafe-est-limite-a-150-choisissez-une-offre-puis-ajoutez-un-espace-cafe-si-besoin"
        ),
        duration: 7000,
      });
    }
    updateCafeEspace(newNbPersonnes);
  };

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE;
      toast({
        title: t("limite-atteinte"),
        description: tCafe(
          "le-nombre-de-personnes-par-espace-cafe-est-limite-a-150-choisissez-une-offre-puis-ajoutez-un-espace-cafe-si-besoin"
        ),
        duration: 7000,
      });
    }
    updateCafeEspace(newNbPersonnes);
  };
  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes < 0) {
      newNbPersonnes = 0;
    }
    updateCafeEspace(newNbPersonnes);
  };

  const handleSelectDureeLocation = (value: string) => {
    //Si j'ai pas de fournisseur encore, je change juste la duree de Location
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dureeLocation: value as DureeLocationCafeType,
        },
      }));
      return;
    }
    //Si j'ai un fournisseur, je dois mettre à jour les prix et les caractéristiques de la machine
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesCafeMachines(nbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif[value as DureeLocationCafeType] !== null &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    //Il se peut que mon fournisseur n'ait pas de tarif ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine => c'est forcément la première machine
      //On retire TOUT
      setCafe((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
          dureeLocation: value as DureeLocationCafeType,
        },
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: null,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                quantites: {
                  ...item.quantites,
                  nbMachines: null,
                  nbPassagesParAn: null,
                },
                prix: {
                  prixLoc: null,
                  prixInstal: null,
                  prixMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
                  prixUnitaireConsoSucre: null,
                },
              }
            : {
                ...item,
                infos: {
                  ...item.infos,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                prix: {
                  prixLoc: null,
                  prixInstal: null,
                  prixMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
                  prixUnitaireConsoSucre: null,
                },
              }
        ),
      }));
      setThe((prev) => ({
        ...prev,
        prix: {
          prixUnitaire: null,
        },
      }));
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) => ({
          ...item,
          total: null,
          totalInstallation: null,
        })),
      }));
      setTotalThe({
        totalService: null,
      });
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const nbMachines = machinesTarifFournisseur?.nbMachines ?? null;
    const prixLoc = machinesTarifFournisseur[value as DureeLocationCafeType];
    const prixInstal = machinesTarifFournisseur.fraisInstallation;
    const prixMaintenance = machinesTarifFournisseur.paMaintenance;
    const nbPassagesParAn = machinesTarifFournisseur?.nbPassages ?? null;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;

    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === espace.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const consoLaitTarifFournisseur = laitConsoTarifs.find(
      (item) =>
        item.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        item.fournisseurId === cafe.infos.fournisseurId
    );
    const typeLait =
      value !== "cafe" ? machinesTarifFournisseur?.typeLait : null;
    const prixUnitaireConsoLait =
      typeLait === "dosettes"
        ? (consoLaitTarifFournisseur?.prixUnitaireDosette ?? null)
        : typeLait === "frais"
          ? (consoLaitTarifFournisseur?.prixUnitaireFrais ?? null)
          : typeLait === "poudre"
            ? (consoLaitTarifFournisseur?.prixUnitairePoudre ?? null)
            : null;

    const consoChocolatTarifFournisseur = chocolatConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const typeChocolat =
      value === "chocolat" ? machinesTarifFournisseur?.typeChocolat : null;
    const prixUnitaireConsoChocolat =
      typeChocolat === "sachets"
        ? (consoChocolatTarifFournisseur?.prixUnitaireSachet ?? null)
        : typeChocolat === "poudre"
          ? (consoChocolatTarifFournisseur?.prixUnitairePoudre ?? null)
          : null;

    const consoSucreTarifFournisseur = sucreConsoTarifs.find(
      (tarif) =>
        tarif.effectif === roundNbPersonnesCafeConso(nbPersonnes) &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    const prixUnitaireConsoSucre =
      consoSucreTarifFournisseur?.prixUnitaire ?? null;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * nbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * nbTassesParAn * RATIO_SUCRE +
      (value !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * nbTassesParAn * RATIO_LAIT
        : 0) +
      (value === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * nbTassesParAn * RATIO_CHOCO
        : 0);
    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.modele ?? null)
      : null;
    const marque = machinesTarifFournisseur
      ? (cafeMachines?.find(
          ({ id }) => id === machinesTarifFournisseur?.cafeMachineId
        )?.marque ?? null)
      : null;
    const reconditionne = machinesTarifFournisseur
      ? (machinesTarifFournisseur.reconditionne ?? null)
      : null;
    //Je mets à jour mon espace
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        dureeLocation: value as DureeLocationCafeType,
      },
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                marque,
                modele,
                reconditionne,
              },
              quantites: {
                ...item.quantites,
                nbPassagesParAn,
                nbMachines,
              },
              prix: {
                prixLoc,
                prixInstal,
                prixMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
                prixUnitaireConsoSucre,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) =>
          item.espaceId === espace.infos.espaceId
            ? {
                ...item,
                total: totalAnnuel,
                totalInstallation: totalInstallation,
              }
            : item
        ),
      }));
    }
  };

  return isTabletOrMobile ? (
    <CafeMobileEspaceInputs
      espace={espace}
      handleChangeTypeBoissons={handleChangeTypeBoissons}
      nbPersonnes={nbPersonnes}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      handleSelectDureeLocation={handleSelectDureeLocation}
      handleIncrement={handleIncrement}
      handleDecrement={handleDecrement}
      cafeEspacesIds={cafeEspacesIds}
    />
  ) : (
    <CafeDesktopEspaceInputs
      espace={espace}
      handleChangeTypeBoissons={handleChangeTypeBoissons}
      nbPersonnes={nbPersonnes}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      handleSelectDureeLocation={handleSelectDureeLocation}
      cafeEspacesIds={cafeEspacesIds}
    />
  );
};

export default CafeEspaceForm;
