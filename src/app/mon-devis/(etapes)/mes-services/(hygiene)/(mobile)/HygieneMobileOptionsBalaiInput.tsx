import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";

type HygieneMobileOptionsBalaiInputProps = {
  nbDistribBalai: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsBalaiInput = ({
  nbDistribBalai,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsBalaiInputProps) => {
  return <div></div>;
};

export default HygieneMobileOptionsBalaiInput;
