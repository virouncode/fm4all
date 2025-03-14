import DevisButton from "@/components/devis-button";
import Image from "next/image";

const Presentation = () => {
  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-8 p-6 text-lg hyphens-auto text-wrap relative"
      id="presentation"
    >
      <div className="flex gap-8 justify-center">
        <div className="flex flex-col gap-6">
          <p className="text-center font-bold text-xl">
            TPE/PME en Île-de-France? <br />
            Vous emménagez dans de nouveaux bureaux? <br />
            Ou envie d’améliorer vos services actuels ?
          </p>
          <div className="flex flex-col gap-4 max-w-prose mx-auto">
            <p>
              <strong>fm4all</strong> simplifie vos démarches d’achats et de
              gestion avec sa <strong>plateforme de Facility Management</strong>{" "}
              : un seul contact, un seul contrat et une seule facture pour
              toutes vos prestations.
            </p>
            <p>
              Choisissez en ligne des prestataires de confiance{" "}
              <strong>au meilleur prix</strong> : nettoyage, café, fontaine à
              eau, sécurité incendie, office management, et plus encore.{" "}
            </p>
            <p>
              Gamme{" "}
              <span className="text-fm4allessential font-bold">Essentiel</span>,{" "}
              <span className="text-fm4allcomfort font-bold">Confort</span> ou{" "}
              <span className="text-fm4allexcellence font-bold">
                Excellence
              </span>{" "}
              : simplifiez, comparez et déléguez en quelques clics.
            </p>
            <p className="mb-6">Prêt à optimiser la gestion de vos bureaux ?</p>
            <DevisButton
              title="Obtenez votre devis en quelques clics"
              text="Obtenez votre devis en quelques clics"
              size="lg"
              className="self-start mx-auto"
            />
          </div>
        </div>
        <div className="h-[470px] w-[450px] relative md:block hidden rounded-xl overflow-hidden">
          <Image
            src={"/img/zen.webp"}
            alt={"image-collaboratrice-zen"}
            fill={true}
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
};

export default Presentation;
