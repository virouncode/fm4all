import { Metadata } from "next";
import MonDevis from "./MonDevis";

export const metadata: Metadata = {
  title: "Mon devis",
  description:
    "Dernière étape du devis: bravo ! Vous avez personnalisé votre devis, il ne vous reste plus qu'à l'afficher",
};

const page = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Mon devis</h1>
      </div>
      <MonDevis />
    </>
  );
};

export default page;
