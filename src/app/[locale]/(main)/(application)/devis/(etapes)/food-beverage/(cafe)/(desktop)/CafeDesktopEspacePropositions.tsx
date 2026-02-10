import NextServiceButton from "@/app/[locale]/(main)/(application)/devis/NextServiceButton";
import { CafeEspaceType } from "@/zod-schemas/cafe.schema";
import { useTranslations } from "next-intl";
import AddEspaceButton from "../AddEspaceButton";
import CafeEspacePropositionFournisseurLogo from "../CafeEspacePropositionFournisseurLogo";
import NextEspaceButton from "../NextEspaceButton";
import CafeEspacePropositionCard from "./CafeEspacePropositionCard";

type CafeDesktopEspacePropositionsProps = {
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  handleClickFirstEspaceProposition: (proposition: {
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
    gamme: "essentiel" | "confort" | "excellence";
    modele: string | null;
    marque: string | null;
    imageUrl: string | null;
    infos: string | null;
    reconditionne: boolean | null;
    typeLait: "dosettes" | "frais" | "poudre" | null;
    typeChocolat: "poudre" | "sachets" | null;
    nbMachines: number | null;
    nbTassesParJ: number;
    nbPassagesParAn: number | null;
    prixLoc: number | null;
    prixInstal: number | null;
    prixMaintenance: number | null;
    prixUnitaireConsoCafe: number | null;
    prixUnitaireConsoLait: number | null;
    prixUnitaireConsoChocolat: number | null;
    prixUnitaireConsoSucre: number | null;
    totalAnnuel: number | null;
    totalInstallation: number | null;
  }) => void;
  espace: CafeEspaceType;
  cafeEspacesIds: number[];
  handleAddEspace: () => void;
  handleClickNext: () => void;
  handleClickNextEspace: () => void;
  handleAlert: () => void;
};

const CafeDesktopEspacePropositions = ({
  formattedPropositions,
  handleClickProposition,
  handleClickFirstEspaceProposition,
  espace,
  cafeEspacesIds,
  handleAddEspace,
  handleClickNext,
  handleClickNextEspace,
  handleAlert,
}: CafeDesktopEspacePropositionsProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto">
      <div className="flex flex-1 flex-col overflow-auto rounded-xl border">
        {formattedPropositions.map((propositions) => (
          <div
            className="flex flex-1 border-b"
            key={propositions[0].fournisseurId}
          >
            <CafeEspacePropositionFournisseurLogo {...propositions[0]} />
            {propositions.map((proposition) => (
              <CafeEspacePropositionCard
                key={proposition.id}
                proposition={proposition}
                handleClickProposition={handleClickProposition}
                handleClickFirstEspaceProposition={
                  handleClickFirstEspaceProposition
                }
                espace={espace}
                cafeEspacesIds={cafeEspacesIds}
              />
            ))}
          </div>
        ))}
      </div>
      {cafeEspacesIds.slice(-1)[0] === espace.infos.espaceId ? (
        <div className="flex items-center justify-end gap-4">
          {espace.infos.gammeCafeSelected ? (
            <AddEspaceButton
              handleAddEspace={handleAddEspace}
              title={t("ajouter-un-espace-cafe")}
            />
          ) : null}
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : (
        <div className="ml-auto" onClick={handleAlert}>
          <NextEspaceButton
            disabled={espace.infos.gammeCafeSelected ? false : true}
            handleClickNextEspace={handleClickNextEspace}
          />
        </div>
      )}
    </div>
  );
};

export default CafeDesktopEspacePropositions;
