import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Nettoyage",
  description:
    "Du nettoyage essentiel à une expérience 5 étoiles, du prestataire PM au grand groupe, choisissez la prestation Propreté qui vous ressemble",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 mb-10">
        <h1 className="text-4xl">Nettoyage</h1>
        <Button
          variant="outline"
          className="flex items-center justify-center text-base"
          asChild
          size="lg"
        >
          <Link href="/nos-services">Revenir aux services</Link>
        </Button>
      </div>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold text-center">
            Du nettoyage essentiel à une expérience 5 étoiles, du prestataire
            PME au grand groupe, choisissez la prestation Propreté qui vous
            ressemble.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/nettoyage.webp"}
              alt="illustration-nettoyage"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Le nettoyage est primordial pour le bien-être au travail. Bien
            au-delà de l’importance d’un environnement sain pour limiter les
            risques de maladies, un espace propre et rangé contribue à faciliter
            le travail et à renforcer l’engagement des collaborateurs.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Quelle gamme de services choisir ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Pour simplifier vos choix, fm4all a préparé des cahiers des charges
            professionnels avec des fréquences de passage adaptées à chaque
            gamme. Voici un résumé des avantages de chaque formule :
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/nettoyage_cdc.webp"}
              alt="nettoyage-cdc"
              quality={100}
              className="object-contain"
              fill={true}
            />
          </div>
        </div>
        <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
          Pour ne pas aller dans des détails trop rébarbatifs (nous sommes là
          pour ça), voici ce que vous obtiendrez pour chaque gamme :
        </p>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Offrez à vos bureaux un entretien fonctionnel et optimisé.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <strong>Focus principal</strong> : Sanitaires et poubelles
              entretenus à chaque passage.
            </li>
            <li className="list-disc">
              <strong>Approche rationelle</strong> : Les fréquences de nettoyage
              sont définies pour couvrir l’essentiel et maintenir un espace
              propre et fonctionnel.
            </li>
            <li className="list-disc">
              <strong>Pour qui ? </strong> Idéal pour ceux qui cherchent une
              solution efficace et maîtrisée.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Garantissez un équilibre parfait entre qualité et efficacité.{" "}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <strong>Couverture complète</strong> : Nettoyage systématique des
              espaces sensibles et entretien régulier des autres zones selon un
              roulement intelligent.
            </li>
            <li className="list-disc">
              <strong>Valeur ajoutée</strong> : Un service sur mesure qui assure
              un rendu soigné sans effort.
            </li>
            <li className="list-disc">
              <strong>Pour qui ? </strong> Conçu pour les entreprises
              recherchant une solution pratique et qualitative.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Optez pour un standard de propreté exemplaire.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <strong>Interventions quotidiennes complètes</strong> : Un
              nettoyage approfondi de l’ensemble des locaux chaque jour.
            </li>
            <li className="list-disc">
              <strong>Image d’excellence</strong> : Reflète une entreprise haut
              de gamme soucieuse de ses collaborateurs et clients.
            </li>
            <li className="list-disc">
              <strong>Pour qui ? </strong> Idéal pour les entreprises
              investissant dans un environnement de travail hautement
              qualitatif.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Comment choisir l’entreprise ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-pretty">
            Tous les prestataires référencés sur fm4all sont soigneusement
            sélectionnés pour leur :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-thumb">Sens du service</li>
            <li className="list-thumb">Réactivité</li>
            <li className="list-thumb">Engagement sur la qualité</li>
            <li className="list-thumb">Prix compétitifs</li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Donc bonne nouvelle ! Tous les prestataires présents sur notre site
            sont des entreprises partenaires.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nos partenaires respectent également notre charte d’achat et nos
            CGV, garantissant des prestations alignées sur vos attentes. Quel
            que soit votre choix, vous avez l’assurance d’une qualité de service
            optimale.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            <strong>
              Confiez à fm4all la gestion de vos prestations pour une garantie
              professionnelle{" "}
            </strong>
            : nos Office Managers, Hospitality Managers et notre équipe
            managériale veillent à la satisfaction de vos besoins tout au long
            de la vie du contrat.
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
