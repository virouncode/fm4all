import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HOF Managers",
  description:
    "Découvrez les HOF Managers de fm4all, des professionnels de l'hospitality, de l'office et du facility management.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl">Hof Managers</h1>
          <Button variant="outline">
            <Link href="/articles">Revenir aux articles</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
          <h2 className="font-bold">
            fm4all réinvente le métier d&apos;Office Manager. Hospitality,
            Office et Facility Manager, trois métiers qui chez fm4all ne font
            plus qu&apos;un : les HOF Managers.
          </h2>
          <p>
            Afin de{" "}
            <strong>
              permettre à un plus grand nombre d&apos;entreprises de bénéficier
              de ces services
            </strong>
            , nous avons associé plusieurs compétences. En combinant les 3
            missions de happiness, office et facility manager, il est plus
            facile de les rendre productifs (ROI) dans{" "}
            <strong>les structures de taille intermédiaire</strong>.
          </p>
          <p>
            Mais puisque ce n&apos;est pas encore assez pour la démocratisation
            de la fonction, fm4all propose ses HOF managers dès une demi-journée
            par semaine ! A temps partiel, les bénéfices de la fonction
            deviennent accessibles au plus grand nombre.
          </p>
          <p>
            <strong>Nous gérons pour vous</strong> tous les contrats de
            prestations de services, l&apos;entretien des locaux,
            l&apos;organisation et la planification de la maintenance,
            l&apos;animation des bureaux, etc...
          </p>
          <p>
            Commande d&apos;un PC ? Gestion de la flotte automobile ? Onboarding
            d&apos;un nouveau collaborateur ? Nous pouvons mettre en place ces
            process.
          </p>
          <p>
            Parce que vous avez mieux à faire, mais que le confort de vos
            collaborateurs n&apos;est pas à prendre à la légère, nos HOF
            Managers sont là pour vous.
          </p>
          <p>
            A partir d&apos;une demi-journée par semaine, dans vos bureaux,{" "}
            <strong>ils s&apos;occupent de tout</strong>.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            L&apos;origine des HOF Managers
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              Hospitality / Happiness Manager, Office Manager ou encore Facility
              Manager, autant de noms pour présenter ces{" "}
              <strong>personnes qui</strong>, au quotidien,{" "}
              <strong>
                prennent soin de vos bâtiments et de leurs occupants.
              </strong>
            </p>
            <p>
              Gestion des prestataires, suivi des prestations, contrôles
              réglementaires, animation des bureaux... Les HOF Managers sont au
              coeur de la vie de vos bureaux.
            </p>
            <p>
              Démocratisées dans les années 2000 par Google, ces fonctions se
              sont professionnalisées au fil du temps pour s&apos;enrichir
              d&apos;outils, de supports, de veille réglementaire et contenus
              d&apos;animation. Comme beaucoup de spécialités, le manque de
              formation interne, de plan de carrière ou encore la contrainte des
              outils ont amené les entreprises à externaliser cette fonction.
            </p>
            <p>
              Désormais confiées à des professionnels, les contraintes de
              recrutement, formation et remplacement sont chez ces prestataires
              de services.
            </p>
            <p>
              Les HOF managers se sont professionnalisés dans des entreprises
              dédiées, mais leur coût en temps plein les réserve aux grandes
              entreprises ou à celles qui investissent beaucoup dans le bien
              être au travail.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Dans le détail des fonctions
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              <strong>Hospitality Manager ou encore Happyness Manager :</strong>
              <br /> Gère l&apos;animation des bureaux et veille au bien-être
              des collaborateurs. Accueil, onboarding d&apos;un nouveau
              collaborateur, conciergerie, organisation évènementiel ou faire
              venir un Ostéopathe au bureau ?... C&apos;est la personne
              qu&apos;il vous faut.
            </p>
            <p>
              <strong>Office Manager :</strong>
              <br />
              Gère la gestion du quotidien des bureaux. Reprographie,
              téléphonie, carfleet, notes de frais ... Si quelqu&apos;un ne sait
              pas quelque chose, lui il sait.
            </p>
            <p>
              <strong>Facility Manager :</strong>
              <br />
              Sachant multi métiers, il encadre, contrôle et manage les
              entreprises de nettoyage, maintenance, café, accueil, etc. La
              réglementation des bâtiments, la gestion financière et le
              management transverse n&apos;ont aucun secret pour lui.
            </p>
            <p>
              Vous l&apos;aurez compris, ce sont trois profils dont les
              missions, définitions, fonctions, ont tendances à se croiser.
            </p>
            <p className="text-center">
              <strong>
                Dans un monde idéal, il en faudrait un de chaque !
              </strong>
            </p>
            <p>
              On y ajouterait même un Factotum / handyman pour faire la petite
              maintenance et les déménagements à la demande. Si vous avez
              50.000m² de bureaux, c&apos;est possible. Pour les autres... il
              fallait une solution.
            </p>
            <p>
              Nous avons donc créé le concept des HOF Managers à temps partiel !
            </p>
            <p>
              HOF Managers : Responsables multi sites formés à la gestion et à
              l&apos;animation des bureaux.
            </p>
            <p>
              Que ce soit pour animer vos bureaux, accueillir vos collaborateurs
              et clients, gérer les petites tâches du quotidien ou vos contrats
              de prestations services, nos HOF Managers sont à votre
              disposition.
            </p>
            <p>
              Issue du FM, leur personnalité et leur expérience leur permettent
              d&apos;appréhender la pluralité des fonctions. Ils sont
              accompagnés par les outils de pilotage, l&apos;encadrement et les
              formations fm4all.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
