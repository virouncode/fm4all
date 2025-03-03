import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Snacks & fruits",
  description: "Selection de snacks et fruits pour vos collaborateurs",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">
        Fruits Frais, Snacks et Boissons : faites rimer bien-être avec
        performance
      </h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous croyons que le bien-être au travail passe aussi
            par une alimentation saine et équilibrée. C’est pourquoi nous
            proposons un service clé en main de mise à disposition de fruits
            frais, de snacks sains et de boissons, livré directement dans vos
            locaux.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/snacks-fruits.webp"}
              alt="illustration-snacks-fruits"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un service complet pour une pause savoureuse et équilibrée
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec notre service, vous avez la garantie de satisfaire les besoins
            et les envies de vos équipes tout en favorisant leur santé.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nos engagements :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Fruits frais chaque semaine : Des paniers garnis de fruits de
              saison, soigneusement sélectionnés pour leur qualité et leur
              fraîcheur
            </li>
            <li className="list-disc">
              Snacks sains : Fruits secs, barres énergétiques naturelles, noix…
              Des alternatives savoureuses et nutritives aux collations
              industrielles
            </li>
            <li className="list-disc">
              Boissons rafraîchissantes et variées : Eau infusée, thés glacés,
              jus de fruits naturels… Tout pour s’hydrater sainement
            </li>
            <li className="list-disc">
              Livraison régulière et flexible : Nous nous adaptons à vos besoins
              pour assurer un réapprovisionnement constant, sans effort de votre
              part
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Les Gammes pour les fruits
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <span className="text-fm4allessential font-bold">
                Gamme Essentiel
              </span>{" "}
              : Environ 1 à 2 par personne par semaine choix standard (+/- 200g)
            </li>
            <li className="list-disc">
              <span className="text-fm4allcomfort font-bold">
                Gamme Confort
              </span>{" "}
              : Environ 2 à 3 par personne par semaine et choix intermédiaire
              (+/- 300g)
            </li>
            <li className="list-disc">
              <span className="text-fm4allexcellence font-bold">
                Gamme Excellence
              </span>{" "}
              : Environ 3 à 4 fruits par personne par semaine et choix premium
              (+/- 400g)
            </li>
          </ul>
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Les Gammes pour les Snacks & Boissons
          </p>
          <ul className="text-lg ml-10 md:w-[660px] md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <span className="text-fm4allessential font-bold">
                Gamme Essentiel
              </span>{" "}
              : 1 portion par personne par semaine, choix standard
            </li>
            <li className="list-disc">
              <span className="text-fm4allcomfort font-bold">
                Gamme Confort
              </span>{" "}
              : 2 portions par personne par semaine, choix intermédiaire
            </li>
            <li className="list-disc">
              <span className="text-fm4allexcellence font-bold">
                Gamme Excellence
              </span>{" "}
              : 4 portions par personne par semaine, choix premium
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Bien-être et performance : une équation gagnante
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Proposer des fruits frais et des collations saines n’est pas un
            simple geste symbolique, c’est un investissement dans la santé et la
            motivation de vos collaborateurs.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Les avantages pour votre entreprise :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Un meilleur bien-être au travail : Une alimentation équilibrée
              contribue à une meilleure concentration, à une réduction du stress
              et à une hausse de l&apos;énergie
            </li>
            <li className="list-disc">
              Une culture d’entreprise positive : Offrir des collations saines
              renforce la satisfaction des équipes et montre votre engagement
              envers leur qualité de vie
            </li>
            <li className="list-disc">
              Un environnement healthy : Un geste simple pour promouvoir de
              bonnes habitudes alimentaires au quotidien
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un sourcing responsable, au service de vos valeurs
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nous privilégions des produits issus de circuits courts, cultivés
            par des producteurs locaux ou engagés dans des démarches durables.
            Nos paniers de fruits et nos snacks sont pensés pour être à la fois
            délicieux et respectueux de l’environnement.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Des résultats prouvés : un investissement rentable
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-pretty">
            Une étude* a démontré que l’introduction de fruits frais sur le lieu
            de travail permet de :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Réduire de 20 à 30 % les arrêts maladies
            </li>
            <li className="list-disc">
              Diminuer l’absentéisme lié à la fatigue ou au stress (15%)
            </li>
            <li className="list-disc">
              Augmenter la productivité des collaborateurs (20%)
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            En investissant dans le bien-être nutritionnel de vos équipes, vous
            contribuez directement à leur santé et, par conséquent, à la
            performance globale de votre entreprise.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap text-center font-bold">
            Un euro investi dans des fruits frais est remboursé plusieurs fois
            par les économies réalisées sur l&apos;absentéisme et la baisse du
            turnover.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            C&apos;est un service qui peut être testé sans engagement. Ce serait
            dommage de s&apos;en priver.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir fm4all pour vos fruits, snacks et boissons ?
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Simplicité : Nous gérons tout, de la sélection des produits à la
              livraison
            </li>
            <li className="list-disc">
              Flexibilité : Des solutions adaptées à vos besoins, avec des
              volumes ajustables
            </li>
            <li className="list-disc">
              Qualité garantie : Des produits frais et savoureux, livrés avec
              soin
            </li>
            <li className="list-disc">
              Engagement durable : Une offre respectueuse de l’environnement et
              des producteurs locaux
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Boostez le bien-être et la santé de vos équipes dès aujourd’hui
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, transformez vos pauses en véritables moments de plaisir
            et de revitalisation. Investissez dans un service qui renforce la
            motivation, la santé et la performance de vos collaborateurs.
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
      </section>
    </main>
  );
};

export default page;
