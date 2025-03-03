import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";

const Articles = () => {
  return (
    <section className="max-w-7xl  w-full mx-auto flex flex-col gap-10 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          Nos derniers articles
        </h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
          title="Tous les articles"
          size="lg"
          asChild
        >
          <Link href="/articles">Tous les articles</Link>
        </Button>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/le-fm-c-quoi.webp"
              alt="illustration-article-le-fm-cest-quoi"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Le FM c&apos;est quoi ?</p>
                <p className="w-full overflow-hidden text-ellipsis">
                  Le FM a plusieurs noms : Facility Management, IFM comme
                  Integrated Facility Management, Facility ser...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/articles/le-fm-cest-quoi">
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/missions-fm.webp"
              alt="illustration-article-les-missions-du-fm"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Les différentes missions du FM</p>
                <p className="overflow-hidden text-ellipsis">
                  On peut résumer les missions du FM selon différents critères
                  (GTB, maintenance préventive, aménageme...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/articles/missions-du-fm">
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/histoire-fm.webp"
              alt="illustration-article-lexternalisation-du-fm"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">
                  Histoire de l&apos;externalisation du FM
                </p>
                <p className="overflow-hidden text-ellipsis">
                  Si on parle de FM comme des services au bâtiment, on peut
                  trouver les balbu...
                </p>
                <div className="flex-1">
                  <Link
                    className="underline"
                    href="/articles/lexternalisation-du-fm"
                  >
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/economies.webp"
              alt="illustration-le-fm-fait-il-faire-des-economies"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Le FM fait-il faire des économies ?</p>
                <p className="overflow-hidden text-ellipsis">
                  La réponse courte est &quot;Oui&quot;. Mais il faut savoir ce
                  que l&apos;on mesure et avoir des attentes réa...
                </p>
                <div className="flex-1">
                  <Link
                    className="underline"
                    href="/articles/le-fm-fait-il-faire-des-economies"
                  >
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/histoire-nettoyage.webp"
              alt="illustration-histoire-du-nettoyage-industriel"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Histoire du nettoyage industriel</p>
                <p className="overflow-hidden text-ellipsis">
                  Il y a plus de 30 ans, les agents de nettoyage (encore appelés
                  &quot;femme de ménage&quot;) étaient directement des salariés
                  des entreprises...
                </p>
                <div className="flex-1">
                  <Link
                    className="underline"
                    href="/articles/histoire-du-nettoyage"
                  >
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/articles/hof.webp"
              alt="illustration-hof-managers"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">HOF Managers</p>
                <p className="overflow-hidden text-ellipsis">
                  fm4all réinvente le métier d&apos;Office Manager. Hospitality,
                  Office et Facility Manager, trois métiers qui chez fm4all ne
                  font plus qu&apos;un...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/articles/hof-managers">
                    Lire l&apos;article
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
        <CarouselNext className="right-0 -top-9 translate-y-0" />
      </Carousel>
      <Link
        href="/articles"
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        Voir tous les articles
      </Link>
    </section>
  );
};

export default Articles;
