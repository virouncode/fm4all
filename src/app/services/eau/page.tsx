import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Fontaine à eau",
  description:
    "Eau filtrée, fraîche, gazeuse, à poser ou encastrer, il y a forcément un modèle fait pour vous.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Fontaine à eau</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto font-bold text-center text-pretty">
            Eau filtrée, fraîche, gazeuse, à poser ou encastrer, il y a
            forcément un modèle fait pour vous.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/fontaines.png"}
              alt="illustration-fontaines-a-eau"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <div className="flex flex-col gap-4 max-w-prose hyphens-auto text-wrap mx-auto">
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              Les bouteilles d&apos;eau ? C&apos;est boire du plastique et c’est
              aussi mauvais pour vous que pour la planète.
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              Les bonbonnes d&apos;eau ? Ce n&apos;est pas beaucoup mieux.
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              L&apos;eau du robinet ? On s&apos;approche de la bonne solution.
              Mais ce n&apos;est pas parfait.
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              Vous ne connaissez pas le niveau de qualité du réseau d&apos;eau,
              du bâtiment, des robinets… Et ce n&apos;est pas rare d’avoir un
              goût désagréable.
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              Les fontaines à eau sur réseau ? Bingo ! De l&apos;eau pure,
              fraîche et filtrée à la demande ! Pas de logistique lourde de
              transport, ni de plastique. Avec l&apos;option eau pétillante,
              c’est royal !
            </p>
            <p className="text-lg max-w-prose hyphens-auto text-wrap">
              L&apos;article R.4225-2 du Code du travail stipule que
              l&apos;employeur doit mettre à disposition des salariés de
              l&apos;eau potable et fraîche en quantité suffisante.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">Un choix simple</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Est-ce à vous de savoir la quantité de gaz nécessaire? Ou de litres
            par heure et par personne dont vous avez besoin? De comparer des
            centaines de références sans savoir ce qui est inclus? Non.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Pour vous aider dans vos démarches, nous avons fait toutes les
            études de marchés nécessaires pour vous.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, vous n&apos;avez rien à gérer. Tous nos tarifs incluent
            l&apos;installation, les consommables (filtres/gaz) et la
            maintenance.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Il ne vous reste qu&apos;à nous dire combien vous êtes, votre gamme
            préférée et on s&apos;occupe du reste.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Des modèles de fontaine réseau à poser sur un comptoir ou une table.
            Ils proposent de l&apos;eau fraîche tout au long de la journée (pied
            ou meuble pour poser la machine sur demande).
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Toujours à poser sur un comptoir ou une table, cette fois avec de
            l&apos;eau fraîche et de l&apos;eau gazeuse (pied ou meuble pour
            poser la machine sur demande).
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Plus design, ce modèle s&apos;installe avec le groupe froid sous un
            comptoir ou dans un meuble. Sur le dessus vous n&apos;avez que le
            bec verseur au style épuré.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une gestion clé en main
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, vous n&apos;avez rien à gérer :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Installation simplifiée : Nos partenaires s&apos;occupent de tout,
              de la mise en place à la configuration de votre fontaine à eau sur
              réseau
            </li>
            <li className="list-disc">
              Maintenance incluse : Nous assurons le suivi technique régulier
              pour garantir une performance optimale de vos équipements
            </li>
            <li className="list-disc">
              Service client réactif : En cas de besoin, notre équipe est à
              votre disposition pour résoudre tout problème rapidement
            </li>
            <li className="list-disc">
              Approche transparente : Pas de surprise, tout est inclus ! Gaz,
              filtres, maintenance… Les quantités nécessaires sont prévues et
              calibrées en fonction du nombre de collaborateurs de vos bureaux
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Fontaine à eau sur réseau : la solution écologique et simplifiée
            pour vos bureaux
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous savons que choisir la bonne solution pour vos
            collaborateurs peut être un casse-tête. C&apos;est pourquoi nous
            avons fait tout le travail pour vous : sélectionner des fontaines à
            eau sur réseau performantes, fiables et adaptées à vos besoins.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec nos fontaines, vous profitez d&apos;une expérience sans
            contrainte : pas de soucis techniques, pas de gestion de stocks,
            simplement une eau pure et fraîche disponible à tout moment.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/fontaines-multi.png"}
              alt="illustration-fontaines-a-eau-multiples"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi opter pour une fontaine à eau sur réseau ?
          </p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Une solution écologique et responsable
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Contrairement aux bouteilles en plastique ou aux fontaines à
            bonbonnes, les fontaines sur réseau se connectent directement à
            votre arrivée d’eau. Résultat :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Réduction des déchets : Fini les bouteilles et bonbonnes jetables
            </li>
            <li className="list-disc">
              Diminution de l’empreinte carbone : Plus besoin de transporter des
              bonbonnes ou palettes d’eau
            </li>
            <li className="list-disc">
              Préservation des ressources : Une filtration efficace pour une eau
              de qualité sans gaspillage
            </li>
          </ul>
          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Un choix économique et pratique
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Plus de stock à gérer : Vous ne manquerez jamais d&apos;eau, votre
              fontaine est alimentée en continu
            </li>
            <li className="list-disc">
              Entretien simplifié : Installation et maintenance sont prises en
              charge par nos partenaires
            </li>
            <li className="list-disc">
              Coût maîtrisé : Un investissement optimisé sans dépenses inutiles
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une sélection pensée pour vous
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous avons sélectionné les meilleures fontaines du
            marché pour vous offrir des produits de confiance :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Qualité premium : Une filtration avancée pour une eau pure et
              agréable au goût
            </li>
            <li className="list-disc">
              Simplicité d’utilisation : Des solutions intuitives, prêtes à
              l&apos;emploi, sans réglages compliqués
            </li>
            <li className="list-disc">
              Design moderne : Des modèles élégants qui s’intègrent parfaitement
              dans vos espaces de travail
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir fm4all pour vos fontaines à eau ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            En travaillant avec nous, vous bénéficiez :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              D&apos;une expertise reconnue : Nous avons sélectionné les
              meilleurs produits et partenaires du marché pour garantir votre
              satisfaction
            </li>
            <li className="list-disc">
              D&apos;une solution éco-responsable : Vous participez activement à
              la réduction des déchets plastiques et à la protection de
              l&apos;environnement
            </li>
            <li className="list-disc">
              D&apos;un service sur-mesure : Nos solutions sont adaptées à vos
              besoins, à votre espace et au nombre de collaborateurs
            </li>
            <li className="list-disc">
              De la tranquillité d&apos;esprit : Nous prenons tout en charge,
              pour que vous puissiez vous concentrer sur l&apos;essentiel
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Faites le choix de l&apos;écologie et de la simplicité
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Offrez à vos collaborateurs une eau fraîche et de qualité tout en
            adoptant une démarche écoresponsable. Avec fm4all, vous alliez
            confort, simplicité et respect de l&apos;environnement.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Découvrez nos solutions dès maintenant et profitez d&apos;un service
            clé en main
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
