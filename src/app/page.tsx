import { Metadata } from "next";
import Articles from "./Articles";
import Hero from "./Hero";
import HofManager from "./HofManager";
import How from "./How";
import Mission from "./Mission";
import Partenaires from "./Partenaires";
import Presentation from "./Presentation";
import Services from "./Services";
import VideoPresentation from "./VideoPresentation";
import Why from "./Why";

export const metadata: Metadata = {
  title: "fm4all : Vos services en entreprise",
  description:
    "Office Management, nettoyage, maintenance règlementaire, machine à café, ... fm4all démocratise le Facility Management pour toutes les tailles d'entreprises. En quelques clics, validez les prestations qui vous conviennent. Cahier des charges, contrats, planification, démarrage, fm4all vous offre un service FM clé en main.",
};

export default function page() {
  return (
    <main className="flex flex-col gap-12 mb-24">
      <Hero />
      <Presentation />
      <Services />
      <Partenaires />
      <VideoPresentation />
      <How />
      <Why />
      <Mission />
      <HofManager />
      <Articles />
    </main>
  );
}
