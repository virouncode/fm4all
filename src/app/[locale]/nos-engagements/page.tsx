import WhyCard from "@/components/cards/WhyCard";
import { Button } from "@/components/ui/button";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos engagements",
  description:
    "Nos engagements : Garantie, Simplicité, Gain de temps, Suivi opérationnel personnalisé, Garantie Qualité",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Nos engagements</h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            Chez fm4all, nous avons à cœur de bâtir des relations de confiance
            et de fournir des services d’excellence. Nos engagements reflètent
            notre volonté de placer vos besoins, vos attentes, et vos valeurs au
            centre de nos priorités.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 mt-10 mb-10">
            <WhyCard
              title="Simplicité"
              content="3 gammes de services standardisées pour une comparaison et un choix faciles."
              icon={Feather}
            />
            <WhyCard
              title="Rapidité"
              content="Devis personnalisés en ligne en quelques minutes, prêt à démarrer."
              icon={Rabbit}
            />
            <WhyCard
              title="Fiabilité"
              content="Contrats clairs et partenaires de confiance rigoureusement sélectionnés."
              icon={Handshake}
            />
            <WhyCard
              title="Sérénité"
              content="Centralisation des demandes, du suivi qualité et des escalades pour une tranquillité d'esprit garantie."
              icon={Waves}
            />
            <WhyCard
              title="Optimisé"
              content="-10% en moyenne grâce aux offres groupées de nos partenaires"
              icon={Euro}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous avons conçu nos services pour répondre aux besoins
            essentiels de vos activités avec une approche basée sur cinq piliers
            fondamentaux : Simplicité, Rapidité, Fiabilité, Sérénité, et
            Optimisation des coûts. Ces engagements sont au cœur de notre
            mission : vous offrir une gestion sans effort et des prestations à
            la hauteur de vos attentes.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">Simplicité</p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous vous simplifions la vie en prenant en charge tous les aspects
            liés à vos services généraux :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Gestion centralisée : Une plateforme unique pour gérer vos
              contrats, vos factures, et vos réclamations
            </li>
            <li className="list-disc">
              Sélection clé en main : Nos prestataires ont été rigoureusement
              choisis pour vous éviter des recherches fastidieuses
            </li>
            <li className="list-disc">
              Expérience fluide : Des processus simplifiés et des outils
              intuitifs pour un gain de temps immédiat
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">Rapiditié</p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Votre temps est précieux, et nous nous engageons à agir avec
            efficacité :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Réactivité maximale : Nos équipes sont disponibles pour répondre à
              vos demandes et intervenir rapidement en cas de besoin
            </li>
            <li className="list-disc">
              Mises en relation rapides : Trouvez les prestataires adaptés à vos
              besoins en un clic grâce à notre plateforme
            </li>
            <li className="list-disc">
              Traitement accéléré : Que ce soit pour une réclamation ou un
              ajustement contractuel, nous agissons sans délai
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">Fiabilité</p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Faites confiance à des experts pour garantir des prestations
            irréprochables :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Partenaires qualifiés : Tous nos prestataires sont sélectionnés
              selon des critères stricts de qualité, d’expertise et de sérieux
            </li>
            <li className="list-disc">
              Contrôles réguliers : Nous vérifions systématiquement la
              conformité des services pour garantir votre satisfaction
            </li>
            <li className="list-disc">
              Engagement sur la durée : Nous veillons à la bonne tenue de vos
              contrats et à la constance des prestations
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">Sérénité</p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Travaillez en toute tranquillité d’esprit grâce à notre
            accompagnement complet :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Point de contact unique : Nous sommes votre interlocuteur dédié
              pour gérer toutes les étapes, des contrats aux éventuels litiges
            </li>
            <li className="list-disc">
              Suivi personnalisé : Nos équipes vous accompagnent pour garantir
              une exécution optimale de vos prestations
            </li>
            <li className="list-disc">
              Qualité garantie : Vous pouvez vous concentrer sur votre cœur
              d’activité pendant que nous nous occupons du reste
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Optimisation des coûts
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous vous aidons à maîtriser vos dépenses tout en maintenant un haut
            niveau de service :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Solutions adaptées : Nos gammes (Essentiel, Confort, Excellence)
              s’ajustent à vos besoins et à votre budget
            </li>
            <li className="list-disc">
              Économies directes et indirectes : En optimisant la gestion
              administrative et en réduisant les efforts internes, nous
              diminuons vos coûts cachés
            </li>
            <li className="list-disc">
              Transparence tarifaire : Vous bénéficiez de tarifs compétitifs et
              d’une visibilité complète sur vos dépenses
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Travaillons ensemble pour une gestion optimisée et sereine
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            En nous confiant vos services généraux, vous faites le choix d’une
            approche moderne, responsable et centrée sur vos priorités. Avec
            fm4all, vous gagnez du temps, réduisez vos efforts, et optimisez vos
            ressources tout en vous assurant des prestations fiables et rapides.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Prêt à simplifier votre quotidien ? Contactez-nous dès aujourd’hui
            et découvrez comment nous pouvons transformer la gestion de vos
            services.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
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
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            1. Qualité et excellence au service de nos clients
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous nous engageons à vous offrir des prestations irréprochables,
            adaptées à vos exigences :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Sélection rigoureuse des partenaires : Tous nos prestataires sont
              minutieusement choisis selon des critères stricts de qualité, de
              fiabilité et d’expertise
            </li>
            <li className="list-disc">
              Contrôles réguliers : Nous évaluons en continu la performance des
              services fournis pour garantir un haut niveau de satisfaction
            </li>
            <li className="list-disc">
              Flexibilité et personnalisation : Que vous soyez une TPE ou une
              grande entreprise, nos solutions s’adaptent à vos besoins
              spécifiques
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            2. Transparence et gestion simplifiée
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Notre plateforme est conçue pour vous offrir une expérience fluide
            et sans surprise :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Gestion centralisée : Contrats, factures, réclamations… tout est
              regroupé pour vous faire gagner du temps
            </li>
            <li className="list-disc">
              Communication claire : Vous bénéficiez d’un suivi détaillé et d’un
              accès en temps réel aux informations de vos prestations
            </li>
            <li className="list-disc">
              Zéro souci administratif : Nous nous occupons de toute la gestion,
              pour que vous puissiez vous concentrer sur votre cœur d’activité
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            3. Engagement écologique et responsable
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous croyons en un avenir durable et intégrons des pratiques
            écoresponsables dans chacun de nos services :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Sourcing responsable : Nos produits, tels que les cafés, snacks ou
              fruits frais, sont sélectionnés avec soin auprès de fournisseurs
              privilégiant des filières éthiques et locales
            </li>
            <li className="list-disc">
              Réduction des déchets : Nous favorisons des solutions
              respectueuses de l’environnement, comme les fontaines à eau sur
              réseau plutôt que les bouteilles en plastique
            </li>
            <li className="list-disc">
              Optimisation énergétique : Nos équipements et partenaires suivent
              des normes strictes pour limiter leur empreinte carbone
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            4. Inclusion et solidarité
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous nous engageons à collaborer avec des entreprises adaptées et à
            encourager l’inclusion sociale :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Partenariat avec des entreprises adaptées : Vous avez la
              possibilité de soutenir l’emploi de personnes en situation de
              handicap en choisissant nos prestations
            </li>
            <li className="list-disc">
              Diversité et égalité : Nous travaillons avec des partenaires
              respectant des politiques inclusives et équitables
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            5. Engagement humain
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous savons que la réussite passe avant tout par des relations
            humaines fortes :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Proximité et écoute : Nos équipes sont disponibles pour répondre à
              vos questions et trouver des solutions à vos problématiques
            </li>
            <li className="list-disc">
              Soutien continu : Qu’il s’agisse de résoudre un litige ou
              d’optimiser vos services, nous restons à vos côtés tout au long de
              notre collaboration
            </li>
            <li className="list-disc">
              Satisfaction client : Votre bien-être et celui de vos
              collaborateurs sont notre priorité absolue
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Travaillons ensemble pour un avenir durable et performant
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            En choisissant fm4all, vous faites le choix d’un partenaire fiable,
            engagé et à l’écoute. Nous ne nous contentons pas de vous
            accompagner : nous nous investissons pleinement pour garantir votre
            satisfaction et celle de vos équipes.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Envie d’en savoir plus sur nos engagements ou nos services ?
            Contactez-nous dès aujourd’hui !
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
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
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
