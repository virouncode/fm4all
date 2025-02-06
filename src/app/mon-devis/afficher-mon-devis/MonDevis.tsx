"use client";
import { useState } from "react";
import DevisDetails from "./DevisDetails";
import DevisSynthese from "./DevisSynthese";
import MonDevisDocument from "./MonDevisDocument";
import MonDevisForm from "./MonDevisForm";

const MonDevis = () => {
  const [devisUrl, setDevisUrl] = useState<string | null>(null);

  return (
    <section className="flex-1 flex flex-col gap-20">
      <MonDevisForm setDevisUrl={setDevisUrl} />
      {devisUrl ? <MonDevisDocument devisUrl={devisUrl} /> : null}
      <DevisSynthese />
      <DevisDetails />
    </section>
  );
};

export default MonDevis;
