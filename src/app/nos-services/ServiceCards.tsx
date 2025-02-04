import ImgCardVertical from "@/components/cards/ImgCardVertical";
import Link from "next/link";

const ServiceCards = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center mt-6 w-full">
      <ImgCardVertical
        src="/img/services/nettoyage.png"
        alt="illustration-nettoyage"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-maintenance"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-securite-incendie"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-fontaine-a-eau"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-cafe"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-snacks"
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
      <ImgCardVertical
        src="https://picsum.photos/350/300"
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
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="illustration-snacks"
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
      <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="illustration-accueil"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-accueil"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
          <p className="text-2xl">Services fm4all</p>
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
      {/* <ImgCardVertical
        src="https://picsum.photos/350/300"
        alt="illustration-accueil"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-petits-travaux"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
        alt="illustration-agent-de-securite"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
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
      </ImgCardVertical> */}
    </div>
  );
};

export default ServiceCards;
