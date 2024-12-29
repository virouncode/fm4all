import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Services = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">Nos services</h2>
        <Button
          variant="outline"
          className="hidden md:block text-base"
          title="Tous les services"
          size="lg"
        >
          <Link href="/nos-services">Tous les services</Link>
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 items-center hyphens-auto text-wrap">
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
              incendie, laissez nos experts vérifier...
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
      </div>
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
