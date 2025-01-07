import DevisButton from "@/components/devis-button";

const Mission = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">Notre mission</h2>
      <div className="flex flex-col gap-4 text-lg w-full max-w-prose hyphens-auto text-wrap mx-auto">
        <p>
          fm4all a analysé des centaines d’appels d’offres, de matrices de
          chiffrage et contrats pour chaque service. Forts de cette analyse,
          nous avons modélisé des{" "}
          <strong>solutions standardisées et personnalisables</strong>,
          permettant d&apos;automatiser les chiffrages tout en s&apos;adaptant
          aux besoins spécifiques de chaque client :
        </p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">
            Un vrai choix avec 3 gammes de services claires
          </li>
          <li className="list-thumb">
            Des devis que l’on peut comparer et personnaliser sans être
            ingénieur métier
          </li>
          <li className="list-thumb">
            Des cahiers des charges et des contrats faciles à mettre en place
          </li>
        </ul>
        <p>
          Sélectionnez vos services, le niveau de gamme, vos options et voilà 🚀
          !
        </p>
        <p>
          Cahier des charges, contrats, planification, démarrage, fm4all vous
          offre un service de Facility Management clé en main.
        </p>
        <p>
          Ne perdez plus de temps à lancer des appels d’offres ou à attendre des
          devis sans réponse.
        </p>
        <DevisButton
          title="Bénéficiez de notre réseau de partenaires en quelques clics"
          text="Bénéficiez de notre réseau de partenaires en quelques clics"
          size="lg"
          className="self-start mx-auto hidden md:block"
        />
        <DevisButton
          title="Bénéficiez de notre réseau"
          text="Bénéficiez de notre réseau"
          size="lg"
          className="self-start mx-auto block md:hidden"
        />
      </div>
    </section>
  );
};

export default Mission;
