import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";

type HygieneMobileOptionsPoubelleInputProps = {
  nbDistribPoubelle: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsPoubelleInput = ({
  nbDistribPoubelle,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsPoubelleInputProps) => {
  return <div></div>;
};

export default HygieneMobileOptionsPoubelleInput;
