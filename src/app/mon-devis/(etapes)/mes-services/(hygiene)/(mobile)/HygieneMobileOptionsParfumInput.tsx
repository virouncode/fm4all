import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";

type HygieneMobileOptionsParfumInputProps = {
  nbDistribParfum: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsParfumInput = ({
  nbDistribParfum,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsParfumInputProps) => {
  return <div></div>;
};

export default HygieneMobileOptionsParfumInput;
