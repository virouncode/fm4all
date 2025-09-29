import { SelectNettoyageProduitType } from "@/zod-schemas/nettoyageProduit";

type NettoyageDesktopPropositions2Props = {
  nettoyageProduits: SelectNettoyageProduitType[];
};

const NettoyageDesktopPropositions2 = async ({
  nettoyageProduits,
}: NettoyageDesktopPropositions2Props) => {
  return <div></div>;
};

export default NettoyageDesktopPropositions2;
