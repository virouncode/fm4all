"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { TypesEauType } from "@/constants/typesEau";
import { toast } from "sonner";
import { roundNbPersonnesFontaine } from "@/lib/utils/roundNbPersonnesFontaine";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { DureeLocationFontaineType } from "@/zod-schemas/dureeLocation.schema";
import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { SelectFontainesModelesType } from "@/zod-schemas/fontainesModeles.schema";
import { SelectFontainesTarifsType } from "@/zod-schemas/fontainesTarifs.schema";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import FontaineDesktopEspaceInputs from "./(desktop)/FontaineDesktopEspaceInputs";
import FontaineMobileEspaceInputs from "./(mobile)/FontaineMobileEspaceInputs";
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
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const prospect = useProspectStore((s) => s.prospect);
  const { fontaines, setFontaines } = useFontainesStore(
    useShallow((s) => ({
      fontaines: s.fontaines,
      setFontaines: s.setFontaines,
    })),
  );
  const fontainesEspacesIds = fontaines.espaces.map(
    (espace) => espace.infos.espaceId,
  );
  const effectif = prospect.effectif ?? 0;
  const nbPersonnes =
    espace.quantites.nbPersonnes ??
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
            : item,
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
        tarif.entrepriseId === fontaines.infos.entrepriseId &&
        tarif[fontaines.infos.dureeLocation] !== null,
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
            entrepriseId: null,
            nomPrestataire: null,
            sloganPrestataire: null,
            logoStorageKey: null,
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
                },
          ),
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
              : item,
          ),
        }));
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc = fontainesTarifFournisseur[fontaines.infos.dureeLocation];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;

    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.modele ?? null)
      : null;
    const marque = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.marque ?? null)
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? (fontainesTarifFournisseur.reconditionne ?? null)
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
          : item,
      ),
    }));
  };

  const updateFontaineEspace = (newNbPersonnes: number) => {
    //Si je n'avais pas de fournisseur, je change juste le nombre de personnes
    if (!fontaines.infos.entrepriseId) {
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
            : item,
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
        tarif.entrepriseId === fontaines.infos.entrepriseId &&
        tarif[fontaines.infos.dureeLocation] !== null,
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
            entrepriseId: null,
            nomPrestataire: null,
            sloganPrestataire: null,
            logoStorageKey: null,
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
                },
          ),
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
              : item,
          ),
        }));
      }
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc = fontainesTarifFournisseur[fontaines.infos.dureeLocation];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;
    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.modele ?? null)
      : null;
    const marque = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.marque ?? null)
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? (fontainesTarifFournisseur.reconditionne ?? null)
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
          : item,
      ),
    }));
  };

  const handleChangeNbPersonnes = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPersonnes = value ? parseInt(value) : 0;
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE;
      toast.error(t("limite-atteinte"), {
        description: tFontaines(
          "le-nombre-de-personnes-par-espace-fontaine-a-eau-est-limite-a-110-choisissez-une-offre-puis-ajoutez-un-espace-fontaine-a-eau-si-besoin",
        ),
        duration: 7000,
      });
    }
    updateFontaineEspace(newNbPersonnes);
  };

  const handleIncrement = () => {
    let newNbPersonnes = nbPersonnes + 1;
    if (newNbPersonnes >= MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE) {
      newNbPersonnes = MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE;
      toast.error(t("limite-atteinte"), {
        description: tFontaines(
          "le-nombre-de-personnes-par-espace-fontaine-a-eau-est-limite-a-110-choisissez-une-offre-puis-ajoutez-un-espace-fontaine-a-eau-si-besoin",
        ),
        duration: 7000,
      });
    }
    updateFontaineEspace(newNbPersonnes);
  };

  const handleDecrement = () => {
    let newNbPersonnes = nbPersonnes - 1;
    if (newNbPersonnes <= 0) {
      newNbPersonnes = 0;
    }
    updateFontaineEspace(newNbPersonnes);
  };

  const handleSelectDureeLocation = (value: string) => {
    //Si j'ai pas de fournisseur encore, je change juste la duree de Location
    if (!fontaines.infos.entrepriseId) {
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
        tarif.entrepriseId === fontaines.infos.entrepriseId,
    );
    //Il se peut que mon fournisseur n'ait pas de tarif ces critères
    if (!fontainesTarifFournisseur) {
      //si c'est la première machine => c'est forcément la première machine
      //On retire TOUT
      setFontaines((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          entrepriseId: null,
          nomPrestataire: null,
          sloganPrestataire: null,
          logoStorageKey: null,
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
              },
        ),
      }));
      return;
    }
    //Le fournisseur a des tarifs pour ces critères ! On reprend le calcul
    const prixLoc =
      fontainesTarifFournisseur[value as DureeLocationFontaineType];
    const prixInstal = fontainesTarifFournisseur.fraisInstallation;
    const prixMaintenance = fontainesTarifFournisseur.paMaintenance;

    const prixUnitaireConsoFiltres =
      fontainesTarifFournisseur.paConsoFiltres ?? null;
    const prixUnitaireConsoCO2 = fontainesTarifFournisseur.paConsoCO2 ?? null;
    const prixUnitaireConsoEauChaude =
      fontainesTarifFournisseur.paConsoEauChaude ?? null;
    //Modele
    const modele = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.modele ?? null)
      : null;
    const marque = fontainesTarifFournisseur
      ? (fontainesModeles?.find(
          ({ id }) => id === fontainesTarifFournisseur?.fontaineId,
        )?.marque ?? null)
      : null;
    const reconditionne = fontainesTarifFournisseur
      ? (fontainesTarifFournisseur.reconditionne ?? null)
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
          : item,
      ),
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <FontaineMobileEspaceInputs
      espace={espace}
      nbPersonnes={nbPersonnes}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      handleSelectDureeLocation={handleSelectDureeLocation}
      fontainesEspacesIds={fontainesEspacesIds}
      handleCheck={handleCheck}
      handleIncrement={handleIncrement}
      handleDecrement={handleDecrement}
    />
  ) : (
    <FontaineDesktopEspaceInputs
      espace={espace}
      nbPersonnes={nbPersonnes}
      handleChangeNbPersonnes={handleChangeNbPersonnes}
      handleSelectDureeLocation={handleSelectDureeLocation}
      fontainesEspacesIds={fontainesEspacesIds}
      handleCheck={handleCheck}
    />
  );
};

export default FontaineEspaceForm;
