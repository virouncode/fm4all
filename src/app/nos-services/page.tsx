import ServiceCards from "./ServiceCards";

const ServicesPage = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nos services</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p className="text-xl">
              fm4all démocratise le <strong>Facility Management</strong> à
              toutes les tailles d&apos;entreprises. En quelques clics,{" "}
              <strong>configurez les services utiles à vos bureaux</strong> et
              confiez nous leur <strong>pilotage</strong> et leur{" "}
              <strong>gestion</strong>.
            </p>
            <p className="text-center text-xl">Nous gérons pour vous :</p>
          </div>
          <ServiceCards />
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi le FM pour tous ?
          </h2>
          <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Parce que nous pensons que les services de Facility Management ne
              devraient pas être réservés aux grandes entreprises.
            </p>
            <p>
              Le Facility Management consiste à confier la gestion du quotidien
              dans vos locaux à un prestataire FM. C&apos;est la{" "}
              <strong>gestion déléguée de tous vos contrats de services</strong>{" "}
              qui n&apos;ont pas de lien avec votre coeur d&apos;activité.
            </p>
            <p>
              <strong>
                Nettoyage, accueil, courrier, café, maintenance, réparations,
                suivi réglementaire de vos locaux
              </strong>
              ... Autant de tâches récurrentes à suivre pour le bon
              fonctionnement de vos bureaux, qui pourtant n&apos;apportent pas
              de valeur ajoutée directe à votre activité professionnelle.
            </p>
            <p>
              Le Facility Management consiste à externaliser la gestion des
              prestataires de services intervenant au quotidien dans vos
              bureaux. Cahier des charges, appels d&apos;offres, négociation
              achats, contractualisation, suivi opérationnel, facturation...
              Autant de <strong>tâches chronophages</strong>, qui ne font pas
              croître votre business et pourtant totalement indispensables.
            </p>
            <p>
              Auparavant réservé aux grands groupes, vous pouvez désormais
              déléguer cette gestion quelle que soit la taille de vos locaux à
              fm4all.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gagnez du temps et de l&apos;argent
          </h2>
          <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              En passant par fm4all, vous profitez de{" "}
              <strong>l&apos;expertise d&apos;un professionnel du FM</strong>,
              des ses partenaires sélectionnés et d&apos;un groupement achats
              spécialisé dans les services d&apos;entretien et maintenance.
            </p>
            <p>
              <strong>
                Une seule facture. Un seul interlocuteur. Un tarif garanti.
              </strong>{" "}
              Vous gagnez en tranquillité d&apos;esprit et en temps de gestion.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">HOF managers</h2>
          <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Hospitality Manager, Office Manager, Facility Manager, ce sont eux
              qui gèrent le bon fonctionnement de vos locaux au quotidien, tout
              en veillant sur vos collaborateurs. Chez fm4all, offrez vous les
              services d&apos;un HOF manager,{" "}
              <strong>une personne dédiée</strong> chez vous à partir d&apos;une
              demi journée par semaine.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default ServicesPage;
