import { Button } from "@/components/ui/button";
import Link from "next/link";

const Presentation = () => {
  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-8 p-6 text-lg hyphens-auto text-wrap"
      id="presentation"
    >
      <p className="text-center font-bold text-xl">
        TPE/PME en Île-de-France? <br />
        Vous emménagez dans de nouveaux bureaux? <br />
        Ou envie d’améliorer vos services actuels ?
      </p>
      <div className="max-w-prose mx-auto">
        <p>
          <strong>fm4all</strong> simplifie vos démarches d’achats et de gestion
          avec sa <strong>plateforme de Facility Management</strong> : un seul
          contact, un seul contrat et une seule facture pour toutes vos
          prestations.
        </p>
        <p>
          Choisissez en ligne des prestataires de confiance{" "}
          <strong>au meilleur prix</strong> : nettoyage, café, fontaine à eau,
          sécurité incendie, office management, et plus encore. Gamme Essentiel,
          Confort ou Excellence : Simplifiez, Comparez et Déléguez en quelques
          clics.
        </p>
        <p>Prêt à optimiser la gestion de vos bureaux ?</p>
      </div>
      <Button
        variant="destructive"
        size="lg"
        className="w-full md:w-auto text-base self-start mx-auto"
      >
        <Link href="/mon-devis">Obtenez votre devis en quelques clics</Link>
      </Button>
    </section>
  );
};

export default Presentation;
