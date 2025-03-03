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

const Services = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">Nos services</h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
          title="Tous les services"
          size="lg"
          asChild
        >
          <Link href="/nos-services">Tous les services</Link>
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
              src="/img/services/nettoyage.webp"
              alt="illustration-nettoyage"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Nettoyage</p>
                <p className="w-full overflow-hidden text-ellipsis">
                  Du nettoyage essentiel à une expérience 5 étoiles, du
                  prestataire PME au grand groupe, choisissez la...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/nettoyage">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/hygiene.webp"
              alt="illustration-hygiene-sanitaire"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Hygiène sanitaire</p>
                <p className="w-full overflow-hidden text-ellipsis">
                  En plus des prestations de nettoyage, fm4all propose la
                  gestion complète des consommables sanitaires...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/hygiene">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/maintenance.webp"
              alt="illustration-maintenance"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Maintenance</p>
                <p className="overflow-hidden text-ellipsis">
                  Gérer un espace de travail fonctionnel et conforme aux
                  réglementations en vigueur peut être complexe et
                  chronophage...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/maintenance">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/incendie.webp"
              alt="illustration-securite-incendie"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Sécurité incendie</p>
                <p className="overflow-hidden text-ellipsis">
                  Sécurité incendie BAES, éxtincteurs, détecteurs de fumée,
                  alarme incendie, laissez nos experts vérifier vos
                  installati...
                </p>
                <div className="flex-1">
                  <Link
                    className="underline"
                    href="/services/securite-incendie"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/cafe.webp"
              alt="illustration-cafe"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Café</p>
                <p className="overflow-hidden text-ellipsis">
                  Chez fm4all, nous savons qu’un bon café fait toute la
                  différence pour vos collaborateurs et vos...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/cafe">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fruits.webp"
              alt="illustration-fruits"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Fruits Frais</p>
                <p className="overflow-hidden text-ellipsis">
                  Donner, c&apos;est recevoir ! Fruité ou gourmand, offrez du
                  bien-être à vos collaborateurs !
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/snacks.webp"
              alt="illustration-snacks"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Snacks</p>
                <p className="overflow-hidden text-ellipsis">
                  Donner, c&apos;est recevoir ! Fruité ou gourmand, offrez du
                  bien-être à vos collaborateurs !
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/boissons.webp"
              alt="illustration-boissons"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Boissons variées</p>
                <p className="overflow-hidden text-ellipsis">
                  Donner, c&apos;est recevoir ! Fruité ou gourmand, offrez du
                  bien-être à vos collaborateurs !
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fontaines.webp"
              alt="illustration-fontaine-a-eau"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Fontaines à eau</p>
                <p className="overflow-hidden text-ellipsis">
                  Eau filtrée, fraîche, gazeuse, à poser ou encastrer, il y a
                  forcément un modèle fait pour vous.
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/eau">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/office-managers-vertical.webp"
              alt="illustration-office-manager"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Office Manager</p>
                <p className="overflow-hidden text-ellipsis">
                  Hospitality, Office ou Facility Manager, une personne dédiée
                  chez vous dès ½ journée par semaine.
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/office-manager">
                    En savoir plus
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fm4all.webp"
              alt="illustration-fm4all"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">Pilotage fm4all</p>
                <p className="overflow-hidden text-ellipsis">
                  Chez fm4all, nous réinventons la gestion des services généraux
                  pour les entreprises. Notre plateforme...
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/office-manager">
                    En savoir plus
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
        href="/nos-services"
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        Voir tous les services
      </Link>
    </section>
  );
};

export default Services;
