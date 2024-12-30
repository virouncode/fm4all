"use client";

import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { useContext } from "react";

const Personnaliser = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  return <div>{devisProgress.currentStep}</div>;
};

export default Personnaliser;
