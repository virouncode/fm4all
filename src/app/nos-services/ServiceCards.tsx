"use client";

import ImgCardVertical from "@/components/cards/ImgCardVertical";
import Link from "next/link";
import { useRef, useEffect } from "react";

const ServiceCards = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = Array.from(containerRef.current.children) as HTMLElement[];
    const lastOffsetTop = items[items.length - 1].offsetTop;
    items.forEach((item) => {
      if (item.offsetTop === lastOffsetTop) {
        item.classList.remove("flex-1");
        item.classList.add("w-[calc(25%-18px)]");
      }
    });
  }, []);
  return (
    <div
      className="flex flex-wrap gap-6 items-center mt-6 w-full"
      ref={containerRef}
    >
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Nettoyage</p>
          <p className="w-full overflow-hidden text-ellipsis">
            D&apos;un passage hebdomadaire à un(e) gouvernant(e) premium,
            trouvez un prestataire Propreté à votre image.
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/nettoyage">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Café</p>
          <p className="overflow-hidden text-ellipsis">
            Blend robusta, Arabica de spécialité, cappuccino noisette ou thé bio
            ? Il y en a pour tous les goûts et budgets.
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/cafe">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Fontaine à eau</p>
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
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Maintenance</p>
          <p className="overflow-hidden text-ellipsis">
            Veille règlementaire, obligations légales, bien-être au travail,
            déléguez la maintenance et le suivi de vos...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/maintenance">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Sécurité incendie</p>
          <p className="overflow-hidden text-ellipsis">
            Sécurité incendie BAES, éxtincteurs, détecteurs de fumée, alarme
            incendie, laissez nos experts vérifier vos installati...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/securite-incendie">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Office Manager</p>
          <p className="overflow-hidden text-ellipsis">
            Hospitality, Office ou Facility Manager, une personne dédiée chez
            vous dès ½ journée par semaine.
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/office-manager">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Accueil</p>
          <p className="overflow-hidden text-ellipsis">
            Vous recevez des clients ou des visiteurs ? Mettez en place un
            accueil physique qui vous ressemble.
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/accueil">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Petits travaux</p>
          <p className="overflow-hidden text-ellipsis">
            Plomberie, électricité, peinture, second oeuvre, confiez vos petits
            travaux récurrents à un prestata...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/petits-travaux">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Snacks & fruits</p>
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
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="service1"
        className="flex-1 min-w-[250px]"
        width={350}
        height={300}
      >
        <div className="p-4 flex flex-col gap-4 h-56">
          <p className="text-2xl">Agent de sécurité</p>
          <p className="overflow-hidden text-ellipsis">
            Télésurveillance ou présence sur site, nos partenaires protègent vos
            installations.
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/agent-de-securite">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
    </div>
  );
};

export default ServiceCards;
