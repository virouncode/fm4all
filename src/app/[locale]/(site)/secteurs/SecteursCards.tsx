import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { urlFor } from "@/sanity/lib/image";
import { getAllSecteurs } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";

const SecteursCards = async () => {
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const secteurs = await getAllSecteurs(locale as "fr" | "en");
  const t = await getTranslations("Global");

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center mt-6 w-full">
      {secteurs.map((secteur) => {
        const secteurImageUrl = secteur.imagePrincipale
          ? urlFor(secteur.imagePrincipale)
          : null; //TODO placeholder image
        const secteurImageAlt = secteur.imagePrincipale?.alt
          ? secteur.imagePrincipale.alt
          : t("illustration-du-secteur");
        const secteurUrl = secteur.slug?.current ?? "";
        return secteurImageUrl ? (
          <ImgCardVertical
            key={secteur._id}
            src={secteurImageUrl.width(800).url()}
            alt={secteurImageAlt}
            href={{
              pathname: `/secteurs/[slug]`,
              params: { slug: secteurUrl },
            }}
          >
            <div className="p-4 flex flex-col gap-4 h-52">
              <p className="text-2xl">{secteur.titre}</p>
              <p className="w-full overflow-hidden line-clamp-3">
                {secteur.description}
              </p>
              <div className="flex-1 underline">{t("en-savoir-plus")}</div>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default SecteursCards;
