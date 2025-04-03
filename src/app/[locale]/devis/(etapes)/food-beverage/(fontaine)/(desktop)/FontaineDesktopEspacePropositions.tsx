import NextServiceButton from "@/app/[locale]/devis/NextServiceButton";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../../(cafe)/AddEspaceButton";
import NextEspaceButton from "../../(cafe)/NextEspaceButton";
import FontaineEspacePropositionCard from "../FontaineEspacePropositionCard";
import FontaineEspacePropositionFournisseurLogo from "../FontaineEspacePropositionFournisseurLogo";

type FontaineDesktopEspacePropositionsProps = {
  formattedPropositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }[][];
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  handleClickFirstEspaceProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    typePose: "aposer" | "colonne" | "comptoir";
    reconditionne: boolean | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoFiltres: number | null;
    prixUnitaireConsoCO2: number | null;
    prixUnitaireConsoEauChaude: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  espace: FontaineEspaceType;
  fontainesEspacesIds: number[];
  handleAddEspace: () => void;
  handleClickNext: () => void;
  handleClickNextEspace: () => void;
  handleAlert: () => void;
};

const FontaineDesktopEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
  handleAddEspace,
  handleClickNext,
  handleClickNextEspace,
  handleAlert,
}: FontaineDesktopEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.fontaines");
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div className="flex-1 flex flex-col border rounded-xl overflow-auto">
        {formattedPropositions.map((propositions) => (
          <div
            className="flex border-b flex-1"
            key={propositions[0].fournisseurId}
          >
            <FontaineEspacePropositionFournisseurLogo {...propositions[0]} />
            {propositions.map((proposition) => (
              <FontaineEspacePropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                handleClickFirstEspaceProposition={
                  handleClickFirstEspaceProposition
                }
                espace={espace}
                fontainesEspacesIds={fontainesEspacesIds}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {fontainesEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
          <div className="flex justify-end gap-4 items-center">
            {espace.infos.poseSelected ? (
              <AddEspaceButton
                handleAddEspace={handleAddEspace}
                title={t("ajouter-un-espace-fontaine")}
              />
            ) : null}
            <NextServiceButton handleClickNext={handleClickNext} />
          </div>
        ) : (
          <div className="ml-auto" onClick={handleAlert}>
            <NextEspaceButton
              disabled={espace.infos.poseSelected ? false : true}
              handleClickNextEspace={handleClickNextEspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FontaineDesktopEspacePropositions;
