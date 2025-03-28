import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Externalisation du FM",
  description:
    "Externaliser le Facility Management, c'est possible pour toutes les tailles d'entreprises. Découvrez comment fm4all démocratise le FM pour tous.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl">
            Histoire de l&apos;externalisation du FM
          </h1>
          <Button
            variant="outline"
            className="flex items-center justify-center text-base"
            asChild
            size="lg"
          >
            <Link href="/articles">Revenir aux articles</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-6 text-lg w-full max-w-prose mx-auto hyphens-auto text-wrap">
          <h2 className="font-bold">
            Si on parle de FM comme des services au bâtiment, on peut trouver
            les balbutiements du métier dès le début du XXe siècle.
          </h2>
          <p>
            Mais si on parle du FM moderne, comme défini sur un précédent
            article, nous pouvons remonter aux années 90.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Années 1990 : Les prémices du FM moderne
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Début des années 1990 : Le FM se structure progressivement en
              France, avec la création des premières sociétés spécialisées et
              l&apos;émergence de concepts comme le &quot;tertiaire&quot;.
            </p>
            <p>
              Milieu des années 1990 : Le FM se professionnalise avec
              l&apos;apparition de formations spécifiques et la création
              d&apos;associations professionnelles.
            </p>
            <p>
              Fin des années 1990 : Le FM s&apos;ouvre à l&apos;international
              avec l&apos;harmonisation des normes et la création de réseaux
              internationaux.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Années 2000 : Le FM entre dans l&apos;ère numérique
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Début des années 2000 : Le développement d&apos;internet et des
              logiciels de gestion accélère la digitalisation du FM. Des
              entreprises comme CAFM Systems et Planon proposent des solutions
              de gestion technique des bâtiments (GTB).
            </p>
            <p>
              Milieu des années 2000 : Le FM se concentre sur
              l&apos;optimisation des coûts et la performance énergétique. Des
              entreprises comme Siemens et Schneider Electric deviennent des
              acteurs majeurs dans ce domaine.
            </p>
            <p>
              Fin des années 2000 : Le FM intègre les enjeux de développement
              durable et de responsabilité sociale des entreprises (RSE).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Années 2010 : Le FM à l&apos;ère du numérique et du collaboratif
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Début des années 2010 : Le smartphone et les objets connectés
              révolutionnent la gestion des installations. Des start-ups comme
              Honeywell et Carrier proposent des solutions innovantes.
            </p>
            <p>
              Milieu des années 2010 : Le FM devient plus collaboratif grâce aux
              plateformes en ligne et aux réseaux sociaux. Des entreprises comme
              Slack et Microsoft Teams facilitent la communication entre les
              différents acteurs.
            </p>
            <p>
              Fin des années 2010 : L&apos;intelligence artificielle et la
              réalité virtuelle font leur entrée dans le FM, notamment pour la
              maintenance prédictive et la formation des techniciens.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Années 2020 et aujourd&apos;hui : Le FM face aux défis de demain
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Pandémie de Covid-19 : Le FM doit s&apos;adapter aux nouveaux
              enjeux sanitaires et sécuritaires.
            </p>
            <p>
              Transition énergétique : Le FM joue un rôle clé dans la réduction
              de l&apos;empreinte carbone des bâtiments.
            </p>
            <p>
              Expérience utilisateur : Le FM se concentre sur
              l&apos;amélioration du confort et de la productivité des occupants
              des bâtiments.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Quelques entreprises ayant marqué le FM (liste non exhaustive)
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              JLL, Cushman & Wakefield, CBRE : Leaders mondiaux du conseil en
              immobilier et du facility management.
            </p>
            <p>
              Siemens, Schneider Electric : Spécialistes de la GTB et des
              solutions énergétiques.
            </p>
            <p>
              IBM, Microsoft : Proposeurs de solutions logicielles pour la
              gestion des installations.
            </p>
            <p>
              Honeywell, Carrier : Acteurs majeurs dans les systèmes de contrôle
              et de gestion des bâtiments.
            </p>
            <p>
              Planon, CAFM Systems : Éditeurs de logiciels de gestion de
              l&apos;immobilier et des installations.
            </p>
            <p>
              Soft Bank Robotics : entre émetteur récepteur, IoT, robots et
              logiciel, l&apos;objectif est d&apos;amener les entreprises dans
              l&apos;air du big data et du bâtiment connecté.
            </p>
            <p>
              fm4all : démocratise le FM à toutes les tailles
              d&apos;entreprises.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
