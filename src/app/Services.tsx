import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Services = () => {
  return (
    <section className="max-w-7xl  w-full mx-auto flex flex-col gap-10 p-6 mt-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl border-l-2 px-4">Nos services</h2>
        <Button
          variant="outline"
          className="hidden md:block"
          title="Tous les services"
        >
          <Link href="/nos-services">Tous les services</Link>
        </Button>
      </div>
      {/* <div className="flex flex-wrap gap-6 items-center"> */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 items-center">
        <ImgCardVertical
          src="https://picsum.photos/350/300"
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
          alt="illustration-cafe"
        >
          <div className="p-4 flex flex-col gap-4 h-52">
            <p className="text-2xl">Café</p>
            <p className="overflow-hidden text-ellipsis">
              Blend robusta, Arabica de spécialité, cappuccino noisette ou thé
              bio ? Il y en a pour tous les goûts et budgets.
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
      </div>
      <Link href="/nos-services" className="underline text-blue-500 text-xl">
        Tous les services
      </Link>
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-20 text-lg hyphens-auto text-wrap">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <p>
            Parce que toutes les entreprises devraient pouvoir s&apos;offrir des
            services de <strong>Facility Management</strong>, nous avons créé{" "}
            <strong>fm4all</strong>, plateforme de souscription de contrat FM en
            ligne.
          </p>
          <p>
            Si les grands groupes délèguent systématiquement la gestion de leurs
            services, pour les surfaces inférieures à 2000m², la gestion
            déléguée est synonyme de coworking souvent chers et peu
            personnalisés.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <p>
            En quelques clics, <strong>cherchez, comparez et déléguez</strong>{" "}
            la gestion de vos contrats de services au bureau. Hospitality
            Manager, Office Manager, Facility Manager, une personne présente
            dans vos bureaux dès ½ journée par semaine.
          </p>
          <p>
            Du nettoyage à la sécurité incendie, en passant par la maintenance
            réglementaire, les snacks, le café et plus encore, comparez &
            trouvez les meilleures offres. Des services au bureau, totalement
            délégués dès 50€ par poste.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
