import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Café et boissons chaudes",
  description: "Découvrez notre sélection de machines à cafés et sachets thés.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">
        Machines à café et consommables : un service sur-mesure pour vos pauses
        café
      </h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous savons qu’un bon café fait toute la différence
            pour vos collaborateurs et vos visiteurs. C’est pourquoi nous vous
            proposons un service complet, clé en main, qui allie qualité,
            simplicité et responsabilité.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/cafe.webp"}
              alt="illustration-cafe"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Une offre complète et sans compromis
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            fm4all prend en charge tous les aspects liés à la gestion de vos
            machines à café et de vos consommables, pour que vous n’ayez qu’à
            profiter d’une pause agréable.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nos services incluent :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Location de machines à café performantes : Des équipements
              modernes, adaptés à vos besoins, qu&apos;il s&apos;agisse
              d&apos;un petit bureau ou d’un grand espace de travail
            </li>
            <li className="list-disc">
              Fourniture de consommables : Café en grains, thé, sucres, lait,
              cacao… Tout ce dont vous avez besoin, livré régulièrement
            </li>
            <li className="list-disc">
              Maintenance : Nous assurons l’entretien préventif et les
              réparations nécessaires pour garantir un fonctionnement optimal de
              vos machines
            </li>
            <li className="list-disc">
              Entretien courant : En fonction des prestataires et des offres,
              profitez de la simple mise à disposition des produits d’entretien,
              jusqu’à la prise en charge totale de l’entretien courant
            </li>
            <li className="list-disc">
              Livraisons régulières : Plus besoin de vous soucier des stocks,
              nous organisons les réapprovisionnements selon vos consommations
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Comment choisir ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            3 types de machines :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Café : Machine à grain proposant des cafés simples espresso ou
              lungo
            </li>
            <li className="list-disc">
              Café + Lait : Machine à grain avec option Lait (automatique ou
              dosette)
            </li>
            <li className="list-disc">
              Café + Lait + Cacao : ajoutez le plaisir du chocolat chaud pour
              vos équipes (automatique ou dosette)
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            La présélection est déjà faite. Il ne vous reste plus qu’à choisir
            si vous souhaitez uniquement du café noir, ou si vous souahaitez
            agrémenter de capuccino et chocolat chaud.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            3 gammes de cafés :
          </p>
          <ul className="text-lg md:w-[660px] ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <span className="text-fm4allessential font-bold">
                Gamme Essentiel
              </span>{" "}
              : Café conventionnel dit Classique, Blend
            </li>
            <li className="list-disc">
              <span className="text-fm4allcomfort font-bold">
                Gamme Confort
              </span>{" "}
              : Café Supérieur, 100% Arabica
            </li>
            <li className="list-disc">
              <span className="text-fm4allexcellence font-bold">
                Gamme Excellence
              </span>{" "}
              : Café de spécialité, premium, café d’exception, Bio
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            3 gammes de thés :
          </p>
          <ul className="text-lg md:w-[660px] ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              <span className="text-fm4allessential font-bold">
                Gamme Essentiel
              </span>{" "}
              : Thé en sachet, un ou deux au choix
            </li>
            <li className="list-disc">
              <span className="text-fm4allcomfort font-bold">
                Gamme Confort
              </span>{" "}
              : Choix de plusieurs thés en sachet
            </li>
            <li className="list-disc">
              <span className="text-fm4allexcellence font-bold">
                Gamme Excellence
              </span>{" "}
              : Thés Premium en boite bois ou présentoire
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap text-center">
            Plusieurs coins pause ou une salle de réunion à équiper ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Sélectionnez une seconde machine selon vos besoins et adaptez-la au
            nombre d’utilisateurs.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Trois types de machines à cafés à grain
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ici, pas de capsules en plastique ou en aluminium. Toutes les
            machines proposées sont des machines espresso à grains. Elles sont
            sélectionnées pour répondre à vos besoins en fonction du nombre de
            collaborateurs.
          </p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Machine à Café Bean To Cup
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Un bon café et “What Else”?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Et bien qu’il soit fraîchement moulu avec une machine à Grain ! Ca
            pollue moins, c’est meilleur et… c’est moins cher (à qualité
            équivalente)
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            La bean to cup c’est l’experte de l’expresso pur par excellence.
            C’est comme son nom l’indique du grain de café à la tasse
            directement.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ici pas de fioriture. Vous avez l’option café ou café long. Le sucre
            et les agitateurs sont inclus.
          </p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Machine à Café + Lait
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ici on élargit les choix de boissons en y intégrant toutes les
            préparations à base de lait comme le café au lait et le Cappuccino.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notez bien qu’il y a trois types de lait :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap flex flex-col gap-4">
            <li className="list-disc">
              Lait en poudre automatique : Ce sont des machines haut de gamme
              qui proposent directement la préparation de votre choix. Elles ne
              demandent aucun entretien de votre part et permet de préparer
              directement dans votre tasse la préparation de votre choix avec du
              café ou simplement de l&apos;eau et du lait lyophilisé
            </li>
            <li className="list-disc">
              Lait frais : Principalement de la marque JURA, cette option permet
              de préparer des boissons à base de lait frais directement. Mais ne
              prenez pas cette option à la légère! Il faut tous les jours une
              personne pour nettoyer le pot à lait et son tuyau. Puis un
              nettoyage approfondi par semaine. Ne prenez cette option que si
              vous avez un Office Manager ou une entreprise de nettoyage 5 jours
              sur 5 avec fm4all
            </li>
            <li className="list-disc">
              Lait en dosette : Cette fois si on coche la case café au lait,
              mais on oublie le cappuccino… Pour vous laissez cette option sans
              vous faire payer une grosse machine automatique, vous pouvez
              disposer de dosette de lait à ajouter à votre espresso préféré
            </li>
          </ul>

          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Machine à Café + Lait + Cacao
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Cette fois c’est le must du must. On élargit encore le choix de
            boissons en y intégrant toutes les préparations à base de lait et de
            Cacao, dont les fameux chocolat chaud et moccacino !
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notez bien qu’il y a toujours 3 types de lait (voir au dessus) mais
            aussi deux types de cacao :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap flex flex-col gap-4">
            <li className="list-disc">
              Cacao en poudre automatique : Ce sont des machines haut de gamme
              qui proposent directement la préparation de votre choix. Elles ne
              demandent aucun entretien de votre part et permet de préparer
              directement dans votre tasse la préparation de votre choix avec du
              café, du lait lyophilisé et du cacao. Les combinaisons sont
              nombreuses
            </li>
            <li className="list-disc">
              Cacao en sachet individuel : Ici encore, rien d’automatique dans
              la tasse. Cependant on vous offre la possibilité de faire un
              chocolat chaud ou un café cacao à base d’un sachet individuel.
              L’usage d’une cuillère peut vous faire économiser le prix de la
              grosse machine automatique ! Plus sérieusement, lorsque vous avez
              moins de 30 collaborateurs sur une machine, c’est une bonne option
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Comment est construit le contrat ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Une machine est mise à votre disposition. Elle reste la propriété du
            partenaire qui se charge de la maintenir. Plus vous vous engagez sur
            un contrat long, plus la machine est amortie, moins la location
            mensuelle coûte chère.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Les consommables? C’est un forfait qui couvre l’ensemble de vos
            besoins selon vos options. Vous serez livrés à fréquence régulière
            pour ne jamais manquer de rien.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Les consommables? C’est un forfait qui couvre l’ensemble de vos
            besoins selon vos options. Vous serez livrés à fréquence régulière
            pour ne jamais manquer de rien.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Les besoins en consommables sont calculés sur les effectifs. Nos
            ratios ont été étudiés sur des centaines de contrats et de sites. Si
            vous avez beaucoup de visiteurs, ne pas les oublier pour que nos
            chiffres soient justes.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un sourcing responsable pour un café de qualité
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nous avons pris le temps de sélectionner des produits qui respectent
            vos attentes en matière de goût, de qualité et de responsabilité.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap flex flex-col gap-4">
            <li className="list-disc">
              Des cafés d’exception : Découvrez une sélection de cafés issus de
              filières responsables, favorisant le commerce équitable et le
              respect de l&apos;environnement.
            </li>
            <li className="list-disc">
              Un engagement écologique : Nos machines sont conçues pour réduire
              leur consommation d’énergie, et nous privilégions les consommables
              recyclables ou biodégradables.
            </li>
            <li className="list-disc">
              Des fournisseurs engagés : Nos partenaires respectent des
              standards élevés en matière d&apos;éthique et de développement
              durable.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir fm4all pour vos pauses café ?
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap flex flex-col gap-4">
            <li className="list-disc">
              Flexibilité : Une offre personnalisée selon vos besoins, du choix
              de la machine à la fréquence des livraisons
            </li>
            <li className="list-disc">
              Simplicité : Nous gérons tout pour vous : la machine, les
              produits, l&apos;entretien et les réapprovisionnements
            </li>
            <li className="list-disc">
              Qualité garantie : Nos partenaires sont rigoureusement
              sélectionnés pour leur professionnalisme et leur éthique
            </li>
            <li className="list-disc">
              Engagement durable : Une solution respectueuse de
              l&apos;environnement et de l&apos;humain, de la production à la
              consommation
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, profitez d’un café de qualité dans des conditions
            optimales. Nous rendons vos pauses simples, agréables et
            responsables.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Choisissez fm4all pour transformer vos moments de convivialité en
            une expérience unique et responsable. Contactez-nous dès maintenant
            pour discuter de vos besoins et découvrir une offre qui vous
            ressemble.
          </p>
        </div>
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
            <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default page;
