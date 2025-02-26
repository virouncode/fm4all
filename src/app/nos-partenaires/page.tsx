import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description:
    "Avec nos partenaires, nous établissons une collaboration fondée sur la qualité et la confiance",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Nos Prestataires Partenaires</h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            Une collaboration fondée sur la qualité et la confiance
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/partenaires.png"}
              alt="illustration-partenaires"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nos partenaires sont bien plus que de simples
            prestataires : ils sont des acteurs essentiels de notre mission
            d’offrir des services de qualité à nos clients. C’est pourquoi nous
            avons mis en place un processus de sélection rigoureux et exigeant,
            ainsi qu’un cadre de suivi collaboratif basé sur des engagements
            clairs et partagés.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un processus de sélection exigeant
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous ne travaillons qu’avec des partenaires qui partagent nos
            valeurs d’excellence, de fiabilité et de respect. Notre sélection
            repose sur plusieurs critères clés :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Expérience et expertise : Les prestataires doivent justifier d’une
              expérience reconnue et d’une expertise avérée dans leur domaine
              d’activité
            </li>
            <li className="list-disc">
              Références vérifiables : Chaque candidat est évalué sur la base de
              ses réalisations passées et des recommandations de ses clients
              existants
            </li>
            <li className="list-disc">
              Capacité d’adaptation : Nous privilégions des partenaires capables
              de répondre rapidement et efficacement aux besoins spécifiques de
              nos clients
            </li>
            <li className="list-disc">
              Respect des normes : Tous les prestataires doivent se conformer
              aux normes réglementaires et aux meilleures pratiques de leur
              secteur
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une charte de partenariat engageante
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Pour garantir un service irréprochable, nous demandons à nos
            partenaires de signer une charte de qualité et de responsabilité.
            Cette charte inclut des engagements forts :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Qualité de service : Maintenir un haut niveau de prestation,
              conformément aux attentes des clients et aux standards de fm4all
            </li>
            <li className="list-disc">
              Réactivité et transparence : Assurer une communication fluide,
              traiter rapidement les réclamations et partager les informations
              nécessaires pour un suivi efficace
            </li>
            <li className="list-disc">
              Engagement environnemental : Privilégier des pratiques
              écoresponsables, comme l’utilisation de produits durables et le
              respect des principes de développement durable
            </li>
            <li className="list-disc">
              Éthique professionnelle : Respecter les droits des employés,
              garantir des conditions de travail justes et adopter une conduite
              exemplaire
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un suivi continu pour une qualité durable
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Collaborer avec fm4all, c’est rejoindre un réseau où la qualité est
            une priorité permanente. Nous effectuons :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Des audits réguliers : Pour évaluer la performance des prestations
              et identifier les axes d’amélioration
            </li>
            <li className="list-disc">
              Un suivi des retours clients : Les retours des utilisateurs finaux
              sont systématiquement pris en compte pour ajuster les prestations
              si nécessaire
            </li>
            <li className="list-disc">
              Des points de contact dédiés : Nos partenaires bénéficient d’un
              interlocuteur unique pour faciliter les échanges et garantir une
              collaboration harmonieuse
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Des avantages pour nos partenaires
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Rejoindre le réseau fm4all, c’est aussi bénéficier de nombreux
            avantages :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Une visibilité accrue : Accédez à un portefeuille de clients
              diversifié et en constante expansion
            </li>
            <li className="list-disc">
              Un accompagnement administratif : Nous prenons en charge la
              gestion contractuelle, la facturation et les aspects
              administratifs pour vous permettre de vous concentrer sur votre
              cœur de métier
            </li>
            <li className="list-disc">
              Des opportunités de croissance : Intégrez un écosystème dynamique
              qui favorise la montée en compétences et l’évolution
              professionnelle
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Rejoignez une communauté engagée
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Chez fm4all, nous croyons en la force des partenariats pour bâtir un
            environnement de travail performant et harmonieux. Nos partenaires
            ne sont pas choisis au hasard : ils incarnent la fiabilité, la
            qualité et l’excellence que nous souhaitons offrir à nos clients.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Vous êtes un prestataire qui partage nos valeurs ? Rejoignez notre
            réseau et contribuez à transformer la gestion des services généraux
            en une expérience simple, efficace et éthique.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3"
          >
            <Link
              href="https://calendly.com/romuald-fm4all/rdv-fm4all"
              target="_blank"
            >
              Je prends un rendez-vous en visio
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3"
          >
            <Link href="tel:+33669311046">Je contacte par téléphone</Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3"
          >
            <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
          </Button>
        </div>
      </article>
    </main>
  );
};

export default page;
