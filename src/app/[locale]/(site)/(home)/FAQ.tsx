import { Accordion } from "@/components/ui/accordion";
import { ReactNode } from "react";
import FAQItem from "./FAQItem";

const faqs: { id: number; question: string; answer: ReactNode }[] = [
  {
    id: 1,
    question: "Qu'est-ce que le facility management en entreprise ?",
    answer: (
      <div className="text-base hyphens-auto">
        <p>
          <strong>
            Le facility management, ou gestion des services généraux
          </strong>
          , désigne l’ensemble des activités de support qui permettent à une
          entreprise de fonctionner efficacement au quotidien. Cela inclut la
          gestion des bâtiments, la maintenance technique, la propreté, la
          sécurité, ou encore les services aux occupants (accueil, courrier,
          espaces verts). L’objectif est d’assurer un environnement de travail
          optimal tout en réduisant les coûts et en améliorant la performance
          globale.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    question:
      "Quels services incluent notre solution de facility management pour les entreprises ?",
    answer: (
      <div className="text-base hyphens-auto flex flex-col gap-4">
        <p>
          Notre solution de facility management est complète et modulable selon
          les besoins de chaque entreprise. Elle comprend :
        </p>
        <ul className="list-disc  ml-6">
          <li>
            <strong>Nettoyage et hygiène sanitaire</strong> des locaux
          </li>
          <li>
            <strong>Maintenance</strong> multi-technique
          </li>
          <li>
            <strong>Sécurité incendie</strong>
          </li>
          <li>
            Location de <strong>machines à café</strong> et livraisons de
            consommables
          </li>
          <li>
            Livraison de <strong>fruits frais</strong> et{" "}
            <strong>snacks sains et gourmands</strong>
          </li>
          <li>
            Livraison de <strong>boissons</strong> variées
          </li>
          <li>
            Location de <strong>fontaines à eau</strong> sur réseau
          </li>
          <li>
            <strong>Office manager externalisé</strong> pour la gestion des
            services
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    question:
      "Quels sont les avantages à externaliser le facility management ?",
    answer: (
      <div className="text-base hyphens-auto flex flex-col gap-4">
        <p>
          Externaliser le facility management présente de nombreux bénéfices
          pour les entreprises :
        </p>
        <ul className="list-disc  ml-6">
          <li>
            <strong>Gain de temps</strong> : focalisez-vous sur votre cœur de
            métier
          </li>
          <li>
            <strong>Réduction des coûts</strong> : mutualisation des services et
            optimisation des ressources
          </li>
          <li>
            <strong>Flexibilité</strong> : adaptation rapide à l’évolution de
            vos besoins
          </li>
          <li>
            <strong>Suivi de la qualité</strong> : indicateurs de performance et
            engagement contractuel
          </li>
        </ul>
        <p>
          Cette approche permet d’augmenter la performance opérationnelle tout
          en assurant un environnement de travail de qualité.
        </p>
      </div>
    ),
  },
  {
    id: 4,
    question: "À qui s'adressent nos prestations de facility management ?",
    answer: (
      <div className="text-base hyphens-auto flex flex-col gap-4">
        <p>
          Nos prestations de facility management s’adressent à une large variété
          d’acteurs professionnels :
        </p>
        <ul className="list-disc  ml-6">
          <li>
            <strong>PME/TPE</strong> qui souhaitent optimiser leurs coûts et
            améliorer leur environnement de travail
          </li>
          <li>
            <strong>Start-up/scale-up</strong> qui ont besoin de flexibilité et
            d’agilité dans la gestion de leurs services
          </li>
          <li>
            <strong>Cabinets médicaux</strong> qui nécessitent des services
            adaptés à leurs normes d&apos;hygiène
          </li>
          <li>
            <strong>Locaux commerciaux</strong> qui veulent offrir une
            expérience client de qualité
          </li>
          <li>
            <strong>Entrepôts logistiques</strong> qui ont besoin de maintenance
            et de sécurité
          </li>
          <li>
            Propriétaires ou gestionnaires d’
            <strong>immeubles tertiaires</strong> qui cherchent à
            professionnaliser la gestion de leurs espaces
          </li>
        </ul>
        <p>
          Quel que soit votre secteur, notre offre s’adapte à vos enjeux
          spécifiques.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    question: "Comment choisir son prestataire de facility management ?",
    answer: (
      <div className="text-base hyphens-auto flex flex-col gap-4">
        <p>
          Pour bien choisir votre prestataire de facility management, voici les
          critères clés à prendre en compte :
        </p>
        <ul className="list-disc  ml-6">
          <li>
            <strong>Expérience et références</strong> dans votre secteur
            d’activité
          </li>
          <li>
            Capacité à proposer une{" "}
            <strong>offre sur mesure et évolutive</strong>
          </li>
          <li>
            <strong>Transparence et engagements contractuels</strong>
          </li>
          <li>
            <strong>Respect des normes et des meilleures pratiques</strong>
          </li>
          <li>
            <strong>Approche durable et innovante</strong>
          </li>
        </ul>
        <p>
          Un bon partenaire saura allier performance opérationnelle, qualité de
          service et respect de vos objectifs stratégiques.
        </p>
      </div>
    ),
  },
];

const FAQ = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6 relative">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">
        Questions fréquemment posées
      </h2>
      <Accordion type="single" collapsible className="w-full lg:w-1/2 px-6">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.id}
            value={`item-${faq.id}`}
            question={faq.question}
          >
            {faq.answer}
          </FAQItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;
