import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos engagements",
  description:
    "Garantie, Simplicité, Gain de temps, Suivi opérationnel personnalisé, Garantie Qualité",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nos engagements</h1>
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto text-justify">
          <h2>
            Garantie, Simplicité, Gain de temps, Suivi opérationnel
            personnalisé, Garantie Qualité, Garantie meilleur prix... Découvrez
            nos engagements.
          </h2>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Garantie Simplicité & Gain de temps
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Comparez les tarifs de centaines de partenaires en quelques clics.
            </p>
            <p>
              Pas d&apos;appel d&apos;offre, de contrat ou de cahier des charges
              compliqués à réaliser, nous nous chargeons de tout.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Suivi opérationnel personnalisé
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>Un seul point de contact pour tous vos contrats !</p>
            <p>
              Devis complémentaire, suivi qualité, facturation... On
              s&apos;occupe de tout.
            </p>
            <p>
              Besoin d&apos;un Office Manager dans vos locaux ? Possible dès ½
              journée par semaine.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Garantie Qualité
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>Nous réalisons le suivi des prestations.</p>
            <p>Nous intervenons sous 24h en cas de défauts.</p>
            <p>Nous changeons le prestataire si nécessaire.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Garantie meilleur prix
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>Bénéficiez de nos tarifs d&apos;achats groupés.</p>
            <p>
              Gestion du quotidien : Nous gérons la relation avec les
              prestataires, les réclamations et la facturation.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Votre contrepartie
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Paiement garanti : Comme un syndic de copropriété, nous
              travaillons sous forme d&apos;appel de charges. Sans frais de
              recouvrement ni d&apos;impayés, cela nous permet des tarifs les
              plus justes et des prestataires satisfaits.
            </p>
            <p>
              Durée de contrat : vous vous engagez pour 12 mois minimum (avec
              garantie qualité).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Vos bénéfices clients
          </h2>
          <div className="md:w-2/3 flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Sans engagement<sup>*</sup>.
            </p>
            <p>Un grand choix de prestations sur une même plateforme.</p>
            <p>Des tarifs préférentiels en quelques clics.</p>
            <p>Une garantie qualité.</p>
            <p>
              Un seul point de contact pour gérer tous les services au bureau.
            </p>
            <p>Un Office Manager présent sur site selon le besoin.</p>
            <p className="text-sm">
              <sup>*</sup> après période initiale 12 mois ou avant en cas de
              défaut de qualité.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
