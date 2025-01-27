import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles intéressants autour du facility management, de l'hospitality managment et de l'office management",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Articles</h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 items-center">
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
          <ImgCardVertical
            src="https://picsum.photos/400/300"
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
        </div>
      </section>
    </main>
  );
};

export default page;
