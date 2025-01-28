"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RATIO_CHOCO, RATIO_LAIT } from "@/constants/constants";
import { locationCafeMachine } from "@/constants/locationsDistribHygiene";
import { typesBoissons, TypesBoissonsType } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { roundEffectif } from "@/lib/roundEffectif";
import { toLimiteBoissonsParJParMachine } from "@/lib/roundLimitBoissonsParJParMachine";
import { CafeLotType } from "@/zod-schemas/cafe";
import { SelectCafeConsoTarifsType } from "@/zod-schemas/cafeConsoTarifs";
import { SelectCafeMachinesType } from "@/zod-schemas/cafeMachine";
import { SelectCafeMachinesTarifsType } from "@/zod-schemas/cafeMachinesTarifs";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
import { SelectChocoConsoTarifsType } from "@/zod-schemas/chocoConsoTarifs";
import { DureeLocationCafeType } from "@/zod-schemas/dureeLocation";
import { SelectLaitConsoTarifsType } from "@/zod-schemas/laitConsoTarifs";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_PERSONNES } from "../../mes-locaux/MesLocaux";

type CafeLotFormProps = {
  lot: CafeLotType;
  cafeMachines: SelectCafeMachinesType[];
  cafeQuantites: SelectCafeQuantitesType[];
  cafeMachinesTarifs: SelectCafeMachinesTarifsType[];
  cafeConsoTarifs: SelectCafeConsoTarifsType[];
  laitConsoTarifs: SelectLaitConsoTarifsType[];
  chocoConsoTarifs: SelectChocoConsoTarifsType[];
};

const CafeLotForm = ({
  lot,
  cafeMachines,
  cafeQuantites,
  cafeMachinesTarifs,
  cafeConsoTarifs,
  laitConsoTarifs,
  chocoConsoTarifs,
}: CafeLotFormProps) => {
  const { client } = useContext(ClientContext);
  const { cafe, setCafe } = useContext(CafeContext);
  const { setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);
  const { setTotalThe } = useContext(TotalTheContext);
  const cafeLotsMachinesIds = cafe.lotsMachines.map((lot) => lot.infos.lotId);
  const effectif = client.effectif ?? 0;
  const nbPersonnes = lot.quantites.nbPersonnes || effectif;

  //Je change le type de boissons
  //Si c'est la première machine :
  //Pour la première machine et les autres : Je ne change pas de fournisseur ni de gamme, je mets juste le total à jour

  const handleChangeTypeBoissons = (value: string) => {
    //JE N'AI PAS DE FOURNISSEUR
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        lotsMachines: prev.lotsMachines.map((item) =>
          item.infos.lotId === lot.infos.lotId
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
    const cafeQuantite = cafeQuantites.find(
      ({ effectif }) => effectif === roundEffectif(nbPersonnes)
    );
    const nbMachines =
      (lot.quantites.nbMachines || cafeQuantite?.nbMachines) ?? 1;
    const nbTassesParAn = nbPersonnes * 400;
    const nbTassesParJParMachine = Math.round((nbPersonnes * 2) / nbMachines);
    const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
      nbTassesParJParMachine
    );
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.limiteTassesJ === limiteTassesJParMachine &&
        tarif.type === value &&
        tarif[cafe.infos.dureeLocation] !== null &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeLotsMachinesIds[0] === lot.infos.lotId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
          },
          lotsMachines: prev.lotsMachines.map((item) =>
            item.infos.lotId === lot.infos.lotId
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
                  prix: {
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
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
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
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
          totalMachines: prev.totalMachines.map((item) => ({
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
          lotsMachines: prev.lotsMachines.map((item) =>
            item.infos.lotId === lot.infos.lotId
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
                  prix: {
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
          totalMachines: prev.totalMachines.map((item) =>
            item.lotId === lot.infos.lotId
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
    const prixUnitaireLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixUnitaireInstal = machinesTarifFournisseur.prixInstallation;
    const prixUnitaireMaintenance = machinesTarifFournisseur.paMaintenance;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === lot.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoLait =
      laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoChocolat =
      chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixAnnuelConsoCafe =
      prixUnitaireConsoCafe !== null
        ? prixUnitaireConsoCafe * nbTassesParAn
        : null;
    const prixAnnuelConsoLait =
      prixUnitaireConsoLait !== null
        ? prixUnitaireConsoLait * nbTassesParAn * RATIO_LAIT
        : null;
    const prixAnnuelConsoChocolat =
      prixUnitaireConsoChocolat !== null
        ? prixUnitaireConsoChocolat * nbTassesParAn * RATIO_CHOCO
        : null;
    const prixAnnuelConso =
      (prixAnnuelConsoCafe ?? 0) +
      (lot.infos.typeBoissons !== "cafe" ? prixAnnuelConsoLait ?? 0 : 0) +
      (lot.infos.typeBoissons === "chocolat"
        ? prixAnnuelConsoChocolat ?? 0
        : 0);

    const prixAnnuel =
      prixUnitaireLoc !== null && prixUnitaireMaintenance !== null
        ? Math.round(
            prixAnnuelConso +
              nbMachines * (prixUnitaireLoc + prixUnitaireMaintenance)
          )
        : null;
    const prixInstallation =
      prixUnitaireInstal !== null ? prixUnitaireInstal * nbMachines : null;

    //Caractéristiques de la machine
    const modele =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.modele ?? null;
    const marque =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.marque ?? null;
    const reconditionne = machinesTarifFournisseur.reconditionne;
    //Je mets à jour ma machine
    setCafe((prev) => ({
      ...prev,
      lotsMachines: prev.lotsMachines.map((item) =>
        item.infos.lotId === lot.infos.lotId
          ? {
              ...item,
              infos: {
                ...item.infos,
                typeBoissons: value as TypesBoissonsType,
                marque,
                modele,
                reconditionne,
              },
              prix: {
                prixUnitaireLoc,
                prixUnitaireInstal,
                prixUnitaireMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (lot.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalMachines: prev.totalMachines.map((item) =>
          item.lotId === lot.infos.lotId
            ? {
                ...item,
                total: prixAnnuel,
                totalInstallation: prixInstallation,
              }
            : item
        ),
      }));
    }
  };

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : effectif;
    if (newNbPersonnes > MAX_NB_PERSONNES) newNbPersonnes = MAX_NB_PERSONNES;
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!cafe.infos.fournisseurId) {
      setCafe((prev) => ({
        ...prev,
        lotsMachines: prev.lotsMachines.map((item) =>
          item.infos.lotId === lot.infos.lotId
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
    const cafeQuantite = cafeQuantites.find(
      ({ effectif }) => effectif === roundEffectif(newNbPersonnes)
    );
    const nbMachines =
      (lot.quantites.nbMachines || cafeQuantite?.nbMachines) ?? 1;
    const nbTassesParAn = newNbPersonnes * 400;
    const nbTassesParJParMachine = Math.round(
      (newNbPersonnes * 2) / nbMachines
    );
    const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
      nbTassesParJParMachine
    );
    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.limiteTassesJ === limiteTassesJParMachine &&
        tarif.type === lot.infos.typeBoissons &&
        tarif[cafe.infos.dureeLocation] !== null &&
        tarif.fournisseurId === cafe.infos.fournisseurId
    );
    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!machinesTarifFournisseur) {
      //si c'est la première machine
      if (cafeLotsMachinesIds[0] === lot.infos.lotId) {
        //On retire TOUT
        setCafe((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
          },
          lotsMachines: prev.lotsMachines.map((item) =>
            item.infos.lotId === lot.infos.lotId
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
                  },
                  prix: {
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
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
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
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
          totalMachines: prev.totalMachines.map((item) => ({
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
          lotsMachines: prev.lotsMachines.map((item) =>
            item.infos.lotId === lot.infos.lotId
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
                  },
                  prix: {
                    prixUnitaireLoc: null,
                    prixUnitaireInstal: null,
                    prixUnitaireMaintenance: null,
                    prixUnitaireConsoCafe: null,
                    prixUnitaireConsoLait: null,
                    prixUnitaireConsoChocolat: null,
                  },
                }
              : item
          ),
        }));
        setTotalCafe((prev) => ({
          totalMachines: prev.totalMachines.map((item) =>
            item.lotId === lot.infos.lotId
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
    const prixUnitaireLoc = machinesTarifFournisseur[cafe.infos.dureeLocation];
    const prixUnitaireInstal = machinesTarifFournisseur.prixInstallation;
    const prixUnitaireMaintenance = machinesTarifFournisseur.paMaintenance;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === lot.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoLait =
      laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoChocolat =
      chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(newNbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixAnnuelConsoCafe =
      prixUnitaireConsoCafe !== null
        ? prixUnitaireConsoCafe * nbTassesParAn
        : null;
    const prixAnnuelConsoLait =
      prixUnitaireConsoLait !== null
        ? prixUnitaireConsoLait * nbTassesParAn * RATIO_LAIT
        : null;
    const prixAnnuelConsoChocolat =
      prixUnitaireConsoChocolat !== null
        ? prixUnitaireConsoChocolat * nbTassesParAn * RATIO_CHOCO
        : null;
    const prixAnnuelConso =
      (prixAnnuelConsoCafe ?? 0) +
      (value !== "cafe" ? prixAnnuelConsoLait ?? 0 : 0) +
      (value === "chocolat" ? prixAnnuelConsoChocolat ?? 0 : 0);
    const prixAnnuel =
      prixUnitaireLoc !== null && prixUnitaireMaintenance !== null
        ? Math.round(
            prixAnnuelConso +
              nbMachines * (prixUnitaireLoc + prixUnitaireMaintenance)
          )
        : null;
    const prixInstallation =
      prixUnitaireInstal !== null ? prixUnitaireInstal * nbMachines : null;
    //Caractéristiques de la machine
    const modele =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.modele ?? null;
    const marque =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.marque ?? null;
    const reconditionne = machinesTarifFournisseur.reconditionne;

    //Je mets à jour  ma machine
    setCafe((prev) => ({
      ...prev,
      lotsMachines: prev.lotsMachines.map((item) =>
        item.infos.lotId === lot.infos.lotId
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
              },
              prix: {
                prixUnitaireLoc,
                prixUnitaireInstal,
                prixUnitaireMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (lot.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalMachines: prev.totalMachines.map((item) =>
          item.lotId === lot.infos.lotId
            ? {
                ...item,
                total: prixAnnuel,
                totalInstallation: prixInstallation,
              }
            : item
        ),
      }));
    }
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
    const cafeQuantite = cafeQuantites.find(
      ({ effectif }) => effectif === roundEffectif(nbPersonnes)
    );
    const nbMachines =
      (lot.quantites.nbMachines || cafeQuantite?.nbMachines) ?? 1;
    const nbCafesParAn = nbPersonnes * 400;
    const nbTassesParJParMachine = Math.round((nbPersonnes * 2) / nbMachines);
    const limiteTassesJParMachine = toLimiteBoissonsParJParMachine(
      nbTassesParJParMachine
    );

    const machinesTarifFournisseur = cafeMachinesTarifs.find(
      (tarif) =>
        tarif.limiteTassesJ === limiteTassesJParMachine &&
        tarif.type === lot.infos.typeBoissons &&
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
          dureeLocation: value as DureeLocationCafeType,
        },
        lotsMachines: prev.lotsMachines.map((item) =>
          item.infos.lotId === lot.infos.lotId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  gammeCafeSelected: null,
                  marque: null,
                  modele: null,
                  reconditionne: false,
                },
                prix: {
                  prixUnitaireLoc: null,
                  prixUnitaireInstal: null,
                  prixUnitaireMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
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
                  prixUnitaireLoc: null,
                  prixUnitaireInstal: null,
                  prixUnitaireMaintenance: null,
                  prixUnitaireConsoCafe: null,
                  prixUnitaireConsoLait: null,
                  prixUnitaireConsoChocolat: null,
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
        totalMachines: prev.totalMachines.map((item) => ({
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
    const prixUnitaireLoc =
      machinesTarifFournisseur[value as DureeLocationCafeType];
    const prixUnitaireInstal = machinesTarifFournisseur.prixInstallation;
    const prixUnitaireMaintenance = machinesTarifFournisseur.paMaintenance;
    const prixUnitaireConsoCafe =
      cafeConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId &&
          item.gamme === lot.infos.gammeCafeSelected
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoLait =
      laitConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixUnitaireConsoChocolat =
      chocoConsoTarifs.find(
        (item) =>
          item.effectif === roundEffectif(nbPersonnes) &&
          item.fournisseurId === cafe.infos.fournisseurId
      )?.prixUnitaire ?? null;
    const prixAnnuelConsoCafe =
      prixUnitaireConsoCafe !== null
        ? prixUnitaireConsoCafe * nbCafesParAn
        : null;
    const prixAnnuelConsoLait =
      prixUnitaireConsoLait !== null
        ? prixUnitaireConsoLait * nbCafesParAn * RATIO_LAIT
        : null;
    const prixAnnuelConsoChocolat =
      prixUnitaireConsoChocolat !== null
        ? prixUnitaireConsoChocolat * nbCafesParAn * RATIO_CHOCO
        : null;

    const prixAnnuelConso =
      (prixAnnuelConsoCafe ?? 0) +
      (value !== "cafe" ? prixAnnuelConsoLait ?? 0 : 0) +
      (value === "chocolat" ? prixAnnuelConsoChocolat ?? 0 : 0);
    const prixAnnuel =
      prixUnitaireLoc !== null && prixUnitaireMaintenance !== null
        ? Math.round(
            prixAnnuelConso +
              nbMachines * (prixUnitaireLoc + prixUnitaireMaintenance)
          )
        : null;
    const prixInstallation =
      prixUnitaireInstal !== null ? prixUnitaireInstal * nbMachines : null;
    //Caractéristiques de la machine
    const modele =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.modele ?? null;
    const marque =
      cafeMachines.find(
        ({ id }) => id === machinesTarifFournisseur.cafeMachineId
      )?.marque ?? null;
    const reconditionne = machinesTarifFournisseur.reconditionne;
    //Je mets à jour le type de boissons de ma machine
    //Je mets à jour  ma machine
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        dureeLocation: value as DureeLocationCafeType,
      },
      lotsMachines: prev.lotsMachines.map((item) =>
        item.infos.lotId === lot.infos.lotId
          ? {
              ...item,
              infos: {
                ...item.infos,
                marque,
                modele,
                reconditionne,
              },
              prix: {
                prixUnitaireLoc,
                prixUnitaireInstal,
                prixUnitaireMaintenance,
                prixUnitaireConsoCafe,
                prixUnitaireConsoLait,
                prixUnitaireConsoChocolat,
              },
            }
          : item
      ),
    }));
    //Je mets à jour les totaux si la gamme a été choisie
    if (lot.infos.gammeCafeSelected) {
      setTotalCafe((prev) => ({
        totalMachines: prev.totalMachines.map((item) =>
          item.lotId === lot.infos.lotId
            ? {
                ...item,
                total: prixAnnuel,
                totalInstallation: prixInstallation,
              }
            : item
        ),
      }));
    }
  };

  return (
    <form className="w-2/3">
      <div className="flex gap-8 items-center mb-4">
        <div>
          <RadioGroup
            onValueChange={handleChangeTypeBoissons}
            value={lot.infos.typeBoissons}
            className="flex gap-4 items-center"
            name="typeBoissons"
          >
            {typesBoissons.map(({ id, description }) => (
              <div key={id} className="flex gap-2 items-center">
                <RadioGroupItem
                  value={id}
                  title={description}
                  id={`${id}_${lot.infos.lotId}`}
                />
                <Label htmlFor={`${id}_${lot.infos.lotId}`}>
                  {description}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            className={`w-full max-w-xs min-w-20 ${
              nbPersonnes === client.effectif ? "text-destructive" : ""
            }`}
            type="number"
            min={1}
            max={MAX_NB_PERSONNES}
            step={1}
            value={nbPersonnes}
            onChange={handleChangeNbPersonnes}
            id={`nbPersonnes_${lot.infos.lotId}`}
          />
          <Label
            htmlFor={`nbPersonnes_${lot.infos.lotId}`}
            className="text-base"
          >
            personnes
          </Label>
        </div>
        {lot.infos.lotId === cafeLotsMachinesIds[0] && (
          <Select
            value={cafe.infos.dureeLocation}
            onValueChange={handleSelectDureeLocation}
          >
            <SelectTrigger className={`w-full max-w-xs`}>
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {locationCafeMachine.map((item) => (
                <SelectItem key={`${location}_${item.id}`} value={item.id}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </form>
  );
};

export default CafeLotForm;
