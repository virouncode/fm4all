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
        src="/img/services/hygiene.png"
        alt="illustration-hygiene-sanitaire"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
          <p className="text-2xl">Hygiène sanitaire</p>
          <p className="w-full overflow-hidden text-ellipsis">
            En plus des prestations de nettoyage, fm4all propose la gestion
            complète des consommables sanitaires...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/hygiene">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="/img/services/maintenance.png"
        alt="illustration-maintenance"
      >
        <div className="p-4 flex flex-col gap-4 h-52">
          <p className="text-2xl">Maintenance</p>
          <p className="overflow-hidden text-ellipsis">
            Gérer un espace de travail fonctionnel et conforme aux
            réglementations en vigueur peut être complexe et chronophage...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/maintenance">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical
        src="/img/services/incendie.png"
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

      <ImgCardVertical src="/img/services/cafe.png" alt="illustration-cafe">
        <div className="p-4 flex flex-col gap-4 h-52">
          <p className="text-2xl">Café</p>
          <p className="overflow-hidden text-ellipsis">
            Chez fm4all, nous savons qu’un bon café fait toute la différence
            pour vos collaborateurs et vos...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/cafe">
              En savoir plus
            </Link>
          </div>
        </div>
      </ImgCardVertical>
      <ImgCardVertical src="/img/services/fruits.png" alt="illustration-fruits">
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
      <ImgCardVertical src="/img/services/snacks.png" alt="illustration-snacks">
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
        src="/img/services/boissons.png"
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
      <ImgCardVertical
        src="/img/services/fontaines.png"
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
        src="/img/services/office-manager.png"
        alt="illustration-office-manager"
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
      <ImgCardVertical src="/img/services/fm4all.png" alt="illustration-fm4all">
        <div className="p-4 flex flex-col gap-4 h-52">
          <p className="text-2xl">Pilotage fm4all</p>
          <p className="overflow-hidden text-ellipsis">
            Chez fm4all, nous réinventons la gestion des services généraux pour
            les entreprises. Notre plateforme...
          </p>
          <div className="flex-1">
            <Link className="underline" href="/services/fm4all">
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
