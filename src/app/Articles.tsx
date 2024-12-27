import ImgCardVertical from "@/components/cards/ImgCardVertical";
import Link from "next/link";

const Articles = () => {
  return (
    <section className="max-w-7xl  w-full mx-auto flex flex-col gap-10 p-6 mt-10">
      <h2 className="text-3xl border-l-2 px-4">Nos derniers articles</h2>
      <div className="flex flex-wrap gap-6 items-center">
        <ImgCardVertical
          src="https://picsum.photos/400/300"
          alt="service1"
          className="flex-1 min-w-[250px]"
          width={400}
          height={300}
        >
          <div className="p-4 flex flex-col gap-4 h-52">
            <p className="text-2xl">Le FM c&apos;est quoi ?</p>
            <p className="w-full overflow-hidden text-ellipsis">
              Le FM a plusieurs noms : Facility Management, IFM comme Integrated
              Facility Management, Facility ser...
            </p>
            <div className="flex-1">
              <Link className="underline" href="/services/nettoyage">
                Lire l&apos;article
              </Link>
            </div>
          </div>
        </ImgCardVertical>
        <ImgCardVertical
          src="https://picsum.photos/400/300"
          alt="service1"
          className="flex-1 min-w-[250px]"
          width={400}
          height={300}
        >
          <div className="p-4 flex flex-col gap-4 h-52">
            <p className="text-2xl">Les différentes missions du FM</p>
            <p className="overflow-hidden text-ellipsis">
              On peut résumer les missions du FM selon différents critères (GTB,
              maintenance préventive, aménageme...
            </p>
            <div className="flex-1">
              <Link className="underline" href="/services/cafe">
                Lire l&apos;article
              </Link>
            </div>
          </div>
        </ImgCardVertical>
        <ImgCardVertical
          src="https://picsum.photos/400/300"
          alt="service1"
          className="flex-1 min-w-[250px]"
          width={400}
          height={300}
        >
          <div className="p-4 flex flex-col gap-4 h-52">
            <p className="text-2xl">Histoire de l&apos;externalisation du FM</p>
            <p className="overflow-hidden text-ellipsis">
              Si on parle de FM comme des services au bâtiment, on peut trouver
              les balbutiements du métier dès le...
            </p>
            <div className="flex-1">
              <Link className="underline" href="/services/eau">
                Lire l&apos;article
              </Link>
            </div>
          </div>
        </ImgCardVertical>
      </div>
    </section>
  );
};

export default Articles;
