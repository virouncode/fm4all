import { TypesEauType } from "@/constants/typesEau";

export const getTypeFontaine = (typeEau: TypesEauType[]) => {
  if (typeEau.includes("Eau gazeuse")) {
    if (typeEau.includes("Eau chaude")) {
      return "ECG";
    } else {
      return "EG";
    }
  } else if (typeEau.includes("Eau chaude")) {
    return "EC";
  } else {
    return "EF";
  }
};
