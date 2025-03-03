import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Office Manager",
  description:
    "Hospitality, Office ou Facility Manager, une personne dédiée chez vous dès ½ journée par semaine.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Office Manager / Hof Manager</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold text-center">
            Hospitality & Office Facility Managers : Une approche innovante et
            accessible à tous
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/office-managers.webp"}
              alt="illustration-office-managers"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Offrez-vous un service premium dès une demi-journée par semaine pour
            vous concentrer sur votre cœur de métier. Avec nos HOF Managers,
            profitez d&apos;une gestion complète et personnalisée de vos besoins
            en Hospitality, Office et Facility Management.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir un HOF Manager ?
          </p>
          <p
            className="text-lg max-w-prose
          hyphens-auto text-wrap font-bold"
          >
            Un service premium accessible
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Vous souhaitez déléguer la gestion quotidienne de vos bureaux pour
            vous concentrer sur l&apos;essentiel ? Vous avez besoin de garantir
            un environnement de travail optimal pour vos équipes, sans vous
            préoccuper des contraintes et des coûts ? Les HOF Managers de fm4all
            réinventent le Facility Management pour les TPE et PME.
          </p>
          <p
            className="text-lg max-w-prose
          hyphens-auto text-wrap font-bold"
          >
            Trois expertises en une seule fonction
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nos HOF Managers allient trois domaines clés pour offrir un service
            complet :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Hospitality : Accueil chaleureux, gestion des visiteurs,
              organisation d&apos;événements, création d&apos;un environnement
              de travail convivial
            </li>
            <li className="list-disc">
              Office Management : Gestion administrative, gestion des
              fournitures, organisation des espaces de travail, support
              logistique
            </li>
            <li className="list-disc">
              Facility Management : Gestion des prestataires, maintenance des
              locaux, gestion des services généraux (nettoyage, sécurité, etc.)
            </li>
          </ul>
          <p
            className="text-lg max-w-prose
          hyphens-auto text-wrap font-bold"
          >
            Une flexibilité adaptée à vos besoins
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Flexibilité : Dès une demi-journée par semaine, bénéficiez d’un
              service adapté à votre budget
            </li>
            <li className="list-disc">
              Expertise : Accédez à un réseau d’Office Managers qualifiés et
              sélectionnés
            </li>
            <li className="list-disc">
              Simplicité : Nous gérons la relation avec l’Office Manger, lui
              fournissons tous les outils pour travailler et vous conservez un
              interlocuteur unique
            </li>
            <li className="list-disc">
              Économies : Évitez les aléas liés à l&apos;embauche d&apos;un
              salarié (maladies, congés, charges…) tout est inclus et
              professionnel
            </li>
          </ul>
          <p
            className="text-lg max-w-prose
          hyphens-auto text-wrap font-bold"
          >
            Les HOF Managers de fm4all, des experts sélectionnés, prennent en
            charge l&apos;ensemble de ces aspects pour vous offrir un service
            complet et personnalisé.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Concrètement, un HOF Manager peut :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Gérer l&apos;accueil et le bien-être de vos collaborateurs et
              visiteurs
            </li>
            <li className="list-disc">
              Organiser vos événements d&apos;entreprise
            </li>
            <li className="list-disc">
              Gérer les contrats avec les prestataires (nettoyage, maintenance,
              etc.)
            </li>
            <li className="list-disc">
              Optimiser l&apos;aménagement de vos espaces de travail
            </li>
            <li className="list-disc">
              Gérer les achats de fournitures et les budgets
            </li>
            <li className="list-disc">
              Assurer le suivi des interventions et la qualité des services
            </li>
          </ul>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-pretty font-bold text-center"
          >
            Offrez à votre entreprise un service premium et concentrez-vous sur
            votre cœur de métier.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Quelle gamme de services choisir ?
          </p>
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Votre HOF Manager joue un rôle de Facility Manager pour assurer :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">La coordination technique des locaux</li>
            <li className="list-disc">Le suivi des sous-traitants</li>
            <li className="list-disc">
              Le contrôle des prestations et la maintenance
            </li>
            <li className="list-disc">La garantie de conformité</li>
            <li className="list-disc">
              La liaison avec le propriétaire, Property Manager ou Asset Manager
            </li>
          </ul>
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Ajoutez une dimension Office Management avec :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              La gestion des contrats de services tiers
            </li>
            <li className="list-disc">
              L&apos;accueil des locaux et le support aux équipes
            </li>
            <li className="list-disc">
              La gestion des logiciels internes (badges, flotte automobile,
              etc.)
            </li>
          </ul>
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Pour un service complet, incluez l’Hospitality Management :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Organisation d&apos;événements et d’animations (petits-déjeuners,
              soirées)
            </li>
            <li className="list-disc">
              Onboarding des nouveaux collaborateurs
            </li>
            <li className="list-disc">
              Création d&apos;un environnement de travail positif
            </li>
            <li className="list-disc">
              Gestion de l&apos;expérience utilisateur et client
            </li>
          </ul>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap font-bold text-center"
          >
            Avec la Gamme Excellence, vous bénéficiez du profil le plus complet,
            combinant bien-être, productivité et efficacité
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Les avantages des HOF Managers
          </p>

          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Économies : Réduisez les coûts par rapport à une embauche à temps
              plein
            </li>
            <li className="list-disc">
              Rendement : Profitez d’un retour sur investissement grâce à des
              services optimisés
            </li>
            <li className="list-disc">
              Le contrôle des prestations et la maintenance
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-8">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Besoin d’aide pour choisir ?
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            N’hésitez pas à nous contacter pour un accompagnement personnalisé.
            Nos HOF Managers sont là pour transformer votre gestion quotidienne
            en un atout stratégique.
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
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Déléguez la gestion complète du quotidien de vos bureaux à nos
            Office Manager fm4all. Hospitality, Office et Facility Manager, ils
            animent vos bureaux et gèrent les prestataires de services. Avec
            fm4all, ce service est accessible dès une demi-journée par semaine.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            La fonction d&apos;Office Manager est primordiale au bon
            fonctionnement d’une entreprise. Chef d’orchestre du quotidien, il
            réalise toutes les tâches et suit les prestataires en lien avec le
            bon fonctionnement des bureaux.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            C&apos;est parce qu&apos;il touche à tout et doit avoir un panel de
            compétences métiers large, que ces fonctions sont souvent
            externalisées dans les grands groupes pour pouvoir s&apos;appuyer
            sur les connaissances et process d’une entreprise de facility
            management.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Problème pour les TPE/PME? Difficile de dédiée une personne à cette
            fonction. Ça coûte cher.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            fm4all réinvente le métier d&apos;Office Manager pour les TPE et PME
            : Les “HOF Manager”.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Afin de permettre à un plus grand nombre d&apos;entreprises de
            bénéficier de ces services, nous avons associé plusieurs compétences
            au rôle d’Office Manager. En combinant les 3 missions de happiness,
            office et facility manager, il est plus facile de les rendre
            productif (ROI) dans les structures de taille intermédiaire.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Hospitality, Office et Facility Manager, trois métiers qui chez
            fm4all ne font plus qu&apos;un : les HOF Managers.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Mais puisque ce n&apos;est pas encore suffisant pour permettre la
            démocratisation de la fonction, fm4all propose ses HOF managers dès
            une demi-journée par semaine !
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            A temps partiel, les bénéfices de la fonction deviennent accessibles
            au plus grand nombre.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Nous gérons pour vous tous les contrats de prestations de services,
            l&apos;entretien des locaux, l&apos;organisation et la planification
            de la maintenance, l&apos;animation des bureaux, etc.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Commande d&apos;un PC ? Gestion de la flotte automobile ? Onboarding
            d&apos;un nouveau collaborateur ? Nous pouvons mettre en place ces
            process.
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            Parce que vous avez mieux à faire, mais que le confort de vos
            utilisateurs n&apos;est pas à prendre à la légère, nos HOF Managers
            sont là pour vous. A partir d&apos;une demi-journée par semaine,
            dans vos bureaux, ils s&apos;occupent de tout.
          </p>
          <div className="w-full md:w-3/4 h-[500px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/office-manager_cdc.webp"}
              alt="office-managers-cdc"
              quality={100}
              className="object-contain"
              fill={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
