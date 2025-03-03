import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Securité incendie",
  description:
    "BAES, éxtincteurs, détecteurs de fumée, alarme incendie, laissez nos experts vérifier vos installations.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">
        Sécurité Incendie : Votre priorité, notre expertise
      </h1>
      <section className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Garantir la sécurité incendie de vos locaux est essentiel, non
            seulement pour protéger vos collaborateurs et vos visiteurs, mais
            aussi pour répondre aux obligations réglementaires en vigueur. Chez
            fm4all, nous prenons en charge l’ensemble des démarches liées aux
            contrôles réglementaires de vos équipements incendie, ainsi que
            l’entretien et la maintenance des installations spécifiques, pour
            une tranquillité d’esprit totale.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/incendie.webp"}
              alt="illustration-incendie"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <div className="flex flex-col gap-6">
            <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
              Vos obligations, nos solutions
            </p>
            <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
              Les entreprises en France ont l’obligation légale de maintenir
              leurs équipements incendie en parfait état de fonctionnement et de
              procéder à des contrôles réguliers. Avec fm4all, vous êtes sûr de
              respecter ces obligations sans effort supplémentaire.
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
              Contrôles réglementaires des extincteurs
            </p>
            <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
              <li className="list-disc">
                Vérification annuelle obligatoire : Nous contrôlons l&apos;état,
                la pression et le bon fonctionnement de vos extincteurs selon
                les normes en vigueur (NF S61-919)
              </li>
              <li className="list-disc">
                Remplacement ou rechargement si nécessaire : Pour garantir une
                performance optimale en cas d&apos;urgence
              </li>
              <li className="list-disc">
                Conseils sur l&apos;implantation : Nous nous assurons que vos
                extincteurs sont positionnés de manière stratégique et conforme
              </li>
            </ul>
            <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
              Contrôles des BAES (Blocs Autonomes d’Éclairage de Sécurité)
            </p>
            <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
              <li className="list-disc">
                Test des dispositifs : Contrôle des batteries, de
                l&apos;autonomie et des lampes pour garantir leur bon
                fonctionnement lors d&apos;une coupure de courant ou d’un
                sinistre
              </li>
              <li className="list-disc">
                Conformité aux normes : Nous nous assurons que vos installations
                respectent la réglementation en vigueur (NF C71-800 et décret du
                25 juin 1980)
              </li>
              <li className="list-disc">
                Maintenance proactive : Remplacement des équipements obsolètes
                ou défectueux
              </li>
            </ul>
            <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
              Autres installations sur demande
            </p>
            <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
              En fonction de vos besoins spécifiques, fm4all propose également :
            </p>
            <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
              <li className="list-disc">
                La vérification et l&apos;entretien des alarmes incendie
              </li>
              <li className="list-disc">
                Le contrôle des systèmes de désenfumage (extraction et
                ventilation)
              </li>
              <li className="list-disc">
                L&apos;inspection des portes coupe-feu
              </li>
              <li className="list-disc">
                La maintenance des colonnes sèches et des robinets d’incendie
                armés (RIA)
              </li>
              <li className="list-disc">
                Des audits personnalisés de sécurité incendie pour identifier et
                combler les éventuelles lacunes
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
              Pourquoi choisir fm4all pour votre sécurité incendie ?
            </p>

            <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
              <li className="list-disc">
                Conformité garantie : Nos interventions respectent
                scrupuleusement les normes réglementaires applicables
              </li>
              <li className="list-disc">
                Traçabilité complète : Chaque contrôle est documenté et archivé
                pour vous fournir des rapports clairs et utilisables en cas
                d’inspection
              </li>
              <li className="list-disc">
                Expertise sur-mesure : Nos partenaires sont des professionnels
                qualifiés, sélectionnés pour leur savoir-faire et leur fiabilité
              </li>
              <li className="list-disc">
                Simplicité administrative : Nous gérons le calendrier des
                contrôles et des interventions pour vous éviter tout oubli ou
                retard
              </li>
              <li className="list-disc">
                Services complémentaires : Une solution complète et intégrée
                pour répondre à tous vos besoins en matière de sécurité incendie
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
              Une gestion clé en main pour votre tranquillité
            </p>
            <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
              Avec fm4all, vous n’avez plus à vous soucier des aspects
              techniques ou réglementaires liés à la sécurité incendie. Nous
              nous occupons de tout, de la planification des contrôles à la
              coordination des prestataires, en passant par la gestion des
              rapports et des recommandations.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
              Protégez vos locaux et vos collaborateurs
            </p>
            <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
              Ne laissez rien au hasard en matière de sécurité incendie. Faites
              confiance à fm4all pour garantir des locaux conformes, sûrs et
              prêts à faire face à toute éventualité.
            </p>
            <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
              Contactez-nous dès aujourd’hui pour discuter de vos besoins et
              bénéficier d’une solution clé en main adaptée à votre entreprise.
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
        </div>
      </section>
    </main>
  );
};

export default page;
