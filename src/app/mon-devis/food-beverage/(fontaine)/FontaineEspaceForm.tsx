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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { locationFontaine } from "@/constants/locationFontaine";
import { typesEau, TypesEauType } from "@/constants/typesEau";
import { typesPose, TypesPoseType } from "@/constants/typesPose";
import { ClientContext } from "@/context/ClientProvider";
import {
  FontainesContext,
  MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE,
} from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { toast } from "@/hooks/use-toast";
import { roundNbPersonnesFontaine } from "@/lib/roundNbPersonnesFontaine";
import { DureeLocationFontaineType } from "@/zod-schemas/dureeLocation";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs";
import { ChangeEvent, useContext } from "react";
type FontaineEspaceFormProps = {
  espace: FontaineEspaceType;
  fontainesModeles: SelectFontainesModelesType[];
  fontainesTarifs: SelectFontainesTarifsType[];
};

const FontaineEspaceForm = ({
  espace,
  fontainesModeles,
  fontainesTarifs,
}: FontaineEspaceFormProps) => {
  const { client } = useContext(ClientContext);
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { setTotalFontaines } = useContext(TotalFontainesContext);
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId
  );
  const effectif = client.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ||
    (effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      : effectif);

  //Je change le type de boissons
  //Si c'est la première machine :
  //Pour la première machine et les autres : Je ne change pas de fournisseur ni de gamme, je mets juste le total à jour
  const handleChangeTypeBoissons = (value: string) => {
    //JE N'AI PAS DE FOURNISSEUR
    if (!fontaines.infos.fournisseurId) {
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  typeBoissons: value as TypesEauType,
                },
              }
            : item
        ),
      }));
      return;
    }
    //J'ai un fournisseur, je dois mettre à jour les prix et les caractéristiques de la machine
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
        tarif.type === value &&
        tarif.typePose === espace.infos.typePose &&
        tarif.fournisseurId === fontaines.infos.fournisseurId &&
        tarif[fontaines.infos.dureeLocation] !== null
    ); //1 ligne par fournisseur
    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!fontainesTarifFournisseur) {
      //si c'est la première machine
      if (fontainesEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setFontaines((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    selected: false,
                    typeBoissons: value as TypesEauType,
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
                    prixUnitaireConsoFiltres: null,
                    prixUnitaireConsoCO2: null,
                    prixUnitaireConsoEauChaude: null,
                  },
                }
          ),
        }));
        setTotalFontaines((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setFontaines((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    typeBoissons: value as TypesEauType,
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
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc = fontainesTarifFournisseur[fontaines.infos.dureeLocation];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;

    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;

    const totalConso =
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0)) *
      nbPersonnes;
    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.modele ?? null
      : null;
    const marque = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.marque ?? null
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? fontainesTarifFournisseur.reconditionne ?? null
      : null;
    //Je mets à jour mon espace
    setFontaines((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                typeBoissons: value as TypesEauType,
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
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.selected) {
      setTotalFontaines((prev) => ({
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

  const handleChangeTypePose = (value: string) => {
    //JE N'AI PAS DE FOURNISSEUR
    if (!fontaines.infos.fournisseurId) {
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  typePose: value as TypesPoseType,
                },
              }
            : item
        ),
      }));
      return;
    }
    //J'ai un fournisseur, je dois mettre à jour les prix et les caractéristiques de la machine
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.typePose === value &&
        tarif.fournisseurId === fontaines.infos.fournisseurId &&
        tarif[fontaines.infos.dureeLocation] !== null
    ); //1 ligne par fournisseur
    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!fontainesTarifFournisseur) {
      //si c'est la première machine
      if (fontainesEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setFontaines((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
          },
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    selected: false,
                    typePose: value as TypesPoseType,
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
                    prixUnitaireConsoFiltres: null,
                    prixUnitaireConsoCO2: null,
                    prixUnitaireConsoEauChaude: null,
                  },
                }
          ),
        }));
        setTotalFontaines((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
        setFontaines((prev) => ({
          ...prev,
          espaces: prev.espaces.map((item) =>
            item.infos.espaceId === espace.infos.espaceId
              ? {
                  ...item,
                  infos: {
                    ...item.infos,
                    typePose: value as TypesPoseType,
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
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc = fontainesTarifFournisseur[fontaines.infos.dureeLocation];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;

    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;

    const totalConso =
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0)) *
      nbPersonnes;
    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.modele ?? null
      : null;
    const marque = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.marque ?? null
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? fontainesTarifFournisseur.reconditionne ?? null
      : null;
    //Je mets à jour mon espace
    setFontaines((prev) => ({
      ...prev,
      espaces: prev.espaces.map((item) =>
        item.infos.espaceId === espace.infos.espaceId
          ? {
              ...item,
              infos: {
                ...item.infos,
                typePose: value as TypesPoseType,
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
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.selected) {
      setTotalFontaines((prev) => ({
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

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : effectif;
    if (newNbPersonnes > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE;
      toast({
        title: "Limite atteinte",
        variant: "destructive",
        description:
          "Le nombre de personnes par espace fontaine à eau est limité à 110. Vous pouvez créer un second espace si besoin",
      });
    }
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!fontaines.infos.fournisseurId) {
      setFontaines((prev) => ({
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
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(newNbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.typePose === espace.infos.typePose &&
        tarif.fournisseurId === fontaines.infos.fournisseurId &&
        tarif[fontaines.infos.dureeLocation] !== null
    );

    //Il se peut que mon fournisseur n'ait pas de tarif pour ces critères
    if (!fontainesTarifFournisseur) {
      //si c'est la première machine
      if (fontainesEspacesIds[0] === espace.infos.espaceId) {
        //On retire TOUT
        setFontaines((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
          },
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
                  quantites: {
                    nbPersonnes: newNbPersonnes,
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
                    prixUnitaireConsoFiltres: null,
                    prixUnitaireConsoCO2: null,
                    prixUnitaireConsoEauChaude: null,
                  },
                }
          ),
        }));
        setTotalFontaines((prev) => ({
          totalEspaces: prev.totalEspaces.map((item) => ({
            ...item,
            total: null,
            totalInstallation: null,
          })),
        }));
      } else {
        //Si c'est pas la première machine on retire juste les choix pour la machine en cours
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
                  quantites: {
                    nbPersonnes: newNbPersonnes,
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
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc = fontainesTarifFournisseur[fontaines.infos.dureeLocation];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;
    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;

    const totalConso =
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0)) *
      newNbPersonnes;

    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.modele ?? null
      : null;
    const marque = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.marque ?? null
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? fontainesTarifFournisseur.reconditionne ?? null
      : null;

    //Je mets à jour  ma machine
    setFontaines((prev) => ({
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
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.selected) {
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

  const handleSelectDureeLocation = (value: string) => {
    //Si j'ai pas de fournisseur encore, je change juste la duree de Location
    if (!fontaines.infos.fournisseurId) {
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dureeLocation: value as DureeLocationFontaineType,
        },
      }));
      return;
    }
    //Si j'ai un fournisseur, je dois mettre à jour les prix et les caractéristiques de la machine
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
        tarif.type === espace.infos.typeBoissons &&
        tarif.typePose === espace.infos.typePose &&
        tarif[value as DureeLocationFontaineType] !== null &&
        tarif.fournisseurId === fontaines.infos.fournisseurId
    );
    //Il se peut que mon fournisseur n'ait pas de tarif ces critères
    if (!fontainesTarifFournisseur) {
      //si c'est la première machine => c'est forcément la première machine
      //On retire TOUT
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          dureeLocation: value as DureeLocationFontaineType,
        },
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
                  prixUnitaireConsoFiltres: null,
                  prixUnitaireConsoCO2: null,
                  prixUnitaireConsoEauChaude: null,
                },
              }
        ),
      }));
      setTotalFontaines((prev) => ({
        totalEspaces: prev.totalEspaces.map((item) => ({
          ...item,
          total: null,
          totalInstallation: null,
        })),
      }));
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc =
      fontainesTarifFournisseur[value as DureeLocationFontaineType];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;
    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;
    const totalInstallation = prixInstal !== null ? prixInstal : null;

    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;
    const totalConso =
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0)) *
      nbPersonnes;

    const totalAnnuel = totalLoc !== null ? totalLoc + totalConso : null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.modele ?? null
      : null;
    const marque = fontainesTarifFournisseur
      ? fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId
        )?.marque ?? null
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? fontainesTarifFournisseur.reconditionne ?? null
      : null;
    //Je mets à jour mon espace
    setFontaines((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        dureeLocation: value as DureeLocationFontaineType,
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
    //Je mets à jour les totaux si la gamme a été choisie
    if (espace.infos.selected) {
      setTotalFontaines((prev) => ({
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

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <form className="w-2/3">
            <div className="flex gap-8 items-center mb-4">
              <div>
                <RadioGroup
                  onValueChange={handleChangeTypeBoissons}
                  value={espace.infos.typeBoissons}
                  className="flex gap-4 items-center"
                  name="typeBoissons"
                >
                  {typesEau.map(({ id, description }) => (
                    <div key={id} className="flex gap-2 items-center">
                      <RadioGroupItem
                        value={id}
                        title={description}
                        id={`${id}_${espace.infos.espaceId}`}
                      />
                      <Label htmlFor={`${id}_${espace.infos.espaceId}`}>
                        {description}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <RadioGroup
                  onValueChange={handleChangeTypePose}
                  value={espace.infos.typePose}
                  className="flex gap-4 items-center"
                  name="typePose"
                >
                  {typesPose.map(({ id, description }) => (
                    <div key={id} className="flex gap-2 items-center">
                      <RadioGroupItem
                        value={id}
                        title={description}
                        id={`${id}_${espace.infos.espaceId}`}
                      />
                      <Label htmlFor={`${id}_${espace.infos.espaceId}`}>
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
                  max={MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE}
                  step={1}
                  value={nbPersonnes}
                  onChange={handleChangeNbPersonnes}
                  id={`nbPersonnes_${espace.infos.espaceId}`}
                />
                <Label
                  htmlFor={`nbPersonnes_${espace.infos.espaceId}`}
                  className="text-base"
                >
                  personnes
                </Label>
              </div>
              {espace.infos.espaceId === fontainesEspacesIds[0] && (
                <Select
                  value={fontaines.infos.dureeLocation}
                  onValueChange={handleSelectDureeLocation}
                >
                  <SelectTrigger className={`w-full max-w-xs`}>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationFontaine.map((item) => (
                      <SelectItem
                        key={`${location}_${item.id}`}
                        value={item.id}
                      >
                        {item.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </form>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          <div>
            <p>Pour votre espace fontaine à eau veuillez sélectionner :</p>
            <ul className="ml-10">
              <li className="list-disc">
                Le type d&apos;eau (EF : eau froide + tempérée, EC : eau froide
                + tempérée + chaude, EG : eau froide + tempérée + gazeuse, ECG :
                eau froide + tempérée + chaude + gazeuse)
              </li>
              <li className="list-disc">Le type de pose</li>
              <li className="list-disc">Le nombre de personnes</li>
              <li className="list-disc">La durée de location</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineEspaceForm;
