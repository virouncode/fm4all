const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Les différentes missions du FM</h1>
        <p className="text-xl">
          On peut résumer les missions du FM selon différents critères (GTB,
          maintenance préventive, aménagement...).
        </p>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion technique des bâtiments (GTB)
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">
              Maintenance préventive des équipements (chauffage, climatisation,
              électricité, etc.)
            </li>
            <li className="list-disc">
              Maintenance corrective en cas d&apos;anomalie ou panne
            </li>
            <li className="list-disc">
              Gestion des énergies (optimisation de la consommation, suivi des
              compteurs)
            </li>
            <li className="list-disc">
              Suivi réglementaire (sécurité, environnement, ...)
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion des espaces et des services
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">
              Gestion des contrats de prestations de services nettoyage, de
              sécurité, de restauration
            </li>
            <li className="list-disc">
              Coordination et suivi des prestataires
            </li>
            <li className="list-disc">
              Aménagement et animation des espaces de travail
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion des projets
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">
              Aménagement, amélioration, rénovation, extension, déménagement
            </li>
            <li className="list-disc">Suivi des budgets et des délais</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion du patrimoine immobilier
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">
              Audit de l&apos;existant : Technique, ESG, décret tertiaire, ...
            </li>
            <li className="list-disc">Évaluation de la valeur des actifs</li>
            <li className="list-disc">
              Améliorer l&apos;existant en préparant l&apos;avenir
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion de la sécurité
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">Mise en place de plans de sécurité</li>
            <li className="list-disc">Surveillance ou télésurveillance</li>
            <li className="list-disc">Gestion des risques</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-xl">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Gestion environnementale
          </h2>
          <ul className="ml-10 md:ml-24 mt-4">
            <li className="list-disc">
              Définition d&apos;une politique environnementale
            </li>
            <li className="list-disc">Mise en oeuvre de la politique</li>
            <li className="list-disc">Gestion des déchets</li>
          </ul>
        </div>
      </article>
    </main>
  );
};

export default page;
