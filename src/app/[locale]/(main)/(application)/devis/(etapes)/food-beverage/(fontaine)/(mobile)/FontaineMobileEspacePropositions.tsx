import { FontaineEspaceType } from "@/zod-schemas/fontaines.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../../(cafe)/AddEspaceButton";
import FontaineMobileEspacePropositionsCarousel from "./FontaineMobileEspacePropositionsCarousel";

type FontaineMobileEspacePropositionsProps = {
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
};

const FontaineMobileEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  fontainesEspacesIds,
  handleAddEspace,
}: FontaineMobileEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.fontaines");
  return (
    <div className="flex w-full flex-col gap-6">
      {formattedPropositions.map((propositions) => (
        <FontaineMobileEspacePropositionsCarousel
          propositions={propositions}
          key={propositions[0].fournisseurId}
          handleClickProposition={handleClickProposition}
          espace={espace}
          fontainesEspacesIds={fontainesEspacesIds}
          handleClickFirstEspaceProposition={handleClickFirstEspaceProposition}
        />
      ))}
      {fontainesEspacesIds.slice(-1)[0] === espace.infos.espaceId &&
      espace.infos.poseSelected ? (
        <div className="mt-2 flex items-center justify-center gap-4">
          <AddEspaceButton
            handleAddEspace={handleAddEspace}
            title={t("ajouter-un-espace-fontaine")}
          />
        </div>
      ) : null}
    </div>
  );
};

export default FontaineMobileEspacePropositions;
