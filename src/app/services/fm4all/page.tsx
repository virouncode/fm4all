import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Pilotage fm4all",
  description:
    "Chez fm4all, nous réinventons la gestion des services généraux pour les entreprises.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Pilotage fm4all</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold text-center">
            Votre plateforme de gestion Facility Services : Simplifiez,
            Centralisez, Optimisez
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/fm4all.webp"}
              alt="illustration-pilotage-fm4all"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous réinventons la gestion des services généraux pour
            les entreprises. Notre plateforme digitale vous met en relation avec
            des prestataires de confiance tout en centralisant l’ensemble des
            aspects administratifs et opérationnels pour un service clé en main,
            efficace et sans effort.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une gestion centralisée et optimisée pour vous libérer du superflu
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec notre plateforme, vous bénéficiez d’une solution unique pour
            gérer vos prestations de Facility Services en toute sérénité :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Un guichet unique : Nous sommes votre point de contact principal
              pour toutes vos prestations (nettoyage, maintenance, sécurité,
              etc.)
            </li>
            <li className="list-disc">
              Gestion administrative complète : Contrats, factures, devis
              complémentaires, réclamations et litiges sont centralisés et pris
              en charge par nos équipes.
            </li>
            <li className="list-disc">
              Suivi rigoureux des prestations : Nous garantissons le respect des
              engagements contractuels de vos prestataires, tout en veillant à
              la qualité et à la satisfaction.
            </li>
            <li className="list-disc">
              Accompagnement proactif : Nous anticipons vos besoins et assurons
              un suivi continu de vos services généraux.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Des options de suivi adaptées à vos besoins
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notre plateforme s’adapte à vos priorités grâce à trois gammes de
            services, conçues pour répondre à différents niveaux d’exigence :
          </p>
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Une solution idéale pour les entreprises cherchant à externaliser
            leurs services généraux à moindre coût, tout en bénéficiant d’un
            service fiable et simplifié.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Fonctionnalités de base de la plateforme
            </li>
            <li className="list-disc">
              Gestion des demandes et support client standard
            </li>
            <li className="list-disc">
              Idéal pour les structures avec des besoins optimisés et peu
              complexes
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Une solution pensée pour les entreprises souhaitant un
            accompagnement renforcé et des fonctionnalités avancées pour une
            gestion plus personnalisée.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Accès à des options avancées de suivi et de gestion
            </li>
            <li className="list-disc">
              Support client privilégié, avec des délais de réponse réduits
            </li>
            <li className="list-disc">
              Idéal pour les entreprises recherchant un équilibre entre
              flexibilité et qualité
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Une offre sur mesure pour les clients les plus exigeants, où chaque
            aspect est optimisé pour un service haut de gamme.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Accompagnement personnalisé et analyses détaillées des prestations
            </li>
            <li className="list-disc">
              Audit régulier et recommandations stratégiques pour améliorer vos
              services généraux.
            </li>
            <li className="list-disc">
              Idéal pour les entreprises cherchant à maximiser leur efficacité
              opérationnelle tout en offrant un environnement de travail
              premium.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir notre plateforme ?
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Gains de temps : Libérez-vous de la gestion administrative
              complexe et concentrez-vous sur votre cœur de métier
            </li>
            <li className="list-disc">
              Qualité garantie : Tous nos prestataires sont sélectionnés pour
              leur engagement, leur réactivité et leur respect des normes
            </li>
            <li className="list-disc">
              Tranquillité d’esprit : Nous sommes le point d’entrée unique pour
              toute réclamation ou litige, en garantissant des solutions rapides
              et efficaces
            </li>
            <li className="list-disc">
              Flexibilité : Nos gammes s’adaptent à vos priorités et à votre
              budget, pour une solution véritablement sur-mesure
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une innovation qui transforme la gestion des services généraux
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, gérez vos prestations avec une simplicité
            déconcertante. Nous faisons le lien entre vos besoins et les
            prestataires adaptés, tout en centralisant l’ensemble des
            interactions. Nos outils digitaux et notre expertise permettent
            d’assurer un suivi rigoureux et une optimisation constante de vos
            services généraux.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Gains de temps : Libérez-vous de la gestion administrative
              complexe et concentrez-vous sur votre cœur de métier
            </li>
            <li className="list-disc">
              Qualité garantie : Tous nos prestataires sont sélectionnés pour
              leur engagement, leur réactivité et leur respect des normes
            </li>
            <li className="list-disc">
              Tranquillité d’esprit : Nous sommes le point d’entrée unique pour
              toute réclamation ou litige, en garantissant des solutions rapides
              et efficaces
            </li>
            <li className="list-disc">
              Flexibilité : Nos gammes s’adaptent à vos priorités et à votre
              budget, pour une solution véritablement sur-mesure
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap text-center font-bold">
            Investissez dans une gestion simplifiée et performante : demandez un
            devis personnalisé dès aujourd’hui.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap text-center font-bold">
            Avec fm4all, vos services généraux deviennent une source de
            performance, et non une contrainte.
          </p>
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
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
          <Image
            src={"/img/services/fm4all_cdc.webp"}
            alt="pilotage-fm4all-cdc"
            quality={100}
            className="object-contain"
            fill={true}
          />
        </div>
      </section>
    </main>
  );
};

export default page;
