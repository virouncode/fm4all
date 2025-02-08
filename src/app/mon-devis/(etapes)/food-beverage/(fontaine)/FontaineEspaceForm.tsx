"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { TypesEauType } from "@/constants/typesEau";
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
import { getTypeFontaine } from "./getTypeFontaine";
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
  const handleCheck = (checked: boolean, type: TypesEauType) => {
    const newTypeEau = checked
      ? [...espace.infos.typeEau, type]
      : espace.infos.typeEau.filter((item) => item !== type);
    //JE N'AI PAS CHOISI DE POSE : je mets juste le formulaire à jour
    if (!espace.infos.poseSelected) {
      setFontaines((prev) => ({
        ...prev,
        espaces: prev.espaces.map((item) =>
          item.infos.espaceId === espace.infos.espaceId
            ? {
                ...item,
                infos: {
                  ...item.infos,
                  typeEau: newTypeEau,
                },
              }
            : item
        ),
      }));
      return;
    }
    //J'ai déjà choisi une pose, je dois mettre à jour les prix et les caractéristiques de la fontaine
    const typeFontaine = getTypeFontaine(newTypeEau);
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
        tarif.type === typeFontaine &&
        tarif.typePose === espace.infos.poseSelected &&
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
                    poseSelected: null,
                    typeEau: newTypeEau,
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
                    typeEau: newTypeEau,
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
                typeEau: newTypeEau,
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
    if (espace.infos.poseSelected) {
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
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE) {
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
    const typeFontaine = getTypeFontaine(espace.infos.typeEau);
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(newNbPersonnes) &&
        tarif.type === typeFontaine &&
        tarif.typePose === espace.infos.poseSelected &&
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
    if (espace.infos.poseSelected) {
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
    const typeFontaine = getTypeFontaine(espace.infos.typeEau);
    const fontainesTarifFournisseur = fontainesTarifs.find(
      (tarif) =>
        tarif.nbPersonnes === roundNbPersonnesFontaine(nbPersonnes) &&
        tarif.type === typeFontaine &&
        tarif.typePose === espace.infos.poseSelected &&
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
    if (espace.infos.poseSelected) {
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
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={espace.infos.typeEau.includes("Eau froide")}
                    onCheckedChange={(checked: boolean) =>
                      handleCheck(checked, "Eau froide")
                    }
                    disabled={true}
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    id="eau froide"
                  />
                  <Label htmlFor="eau froide" className="text-sm">
                    Eau froide
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={espace.infos.typeEau.includes("Eau gazeuse")}
                    onCheckedChange={(checked: boolean) =>
                      handleCheck(checked, "Eau gazeuse")
                    }
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    id="eau gazeuse"
                  />
                  <Label htmlFor="eau gazeuse" className="text-sm">
                    Eau gazeuse
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={espace.infos.typeEau.includes("Eau chaude")}
                    onCheckedChange={(checked: boolean) =>
                      handleCheck(checked, "Eau chaude")
                    }
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    id="boissons"
                  />
                  <Label htmlFor="Eau chaude" className="text-sm">
                    Eau chaude
                  </Label>
                </div>
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
                  <SelectTrigger className={" max-w-xs w-1/4"}>
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
              <li className="list-disc">Le type d&apos;eau</li>
              <li className="list-disc">Le nombre de personnes (max 110)</li>
              {fontainesEspacesIds[0] === espace.infos.espaceId && (
                <li className="list-disc">La durée de location</li>
              )}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineEspaceForm;
