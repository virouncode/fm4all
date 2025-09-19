import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { LocaleType } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";
import { getAllSecteurs } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";

const SecteursCards = async () => {
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const secteurs = await getAllSecteurs(locale as LocaleType);
  const t = await getTranslations("Global");

  return (
    <div
      className={`mt-6 grid w-full items-center gap-6 ${
        secteurs.length === 1
          ? "max-w-[250px] grid-cols-1"
          : "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
      }`}
    >
      {secteurs.map((secteur, index) => {
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
            src={secteurImageUrl.width(500).height(500).url()}
            alt={secteurImageAlt}
            href={{
              pathname: `/secteurs/[slug]`,
              params: { slug: secteurUrl },
            }}
            linkText={secteur.linkText ?? secteurUrl}
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
          >
            <div className="flex h-52 flex-col gap-4 p-4">
              <p className="text-2xl">{secteur.titre}</p>
              <p className="line-clamp-5 w-full overflow-hidden text-sm">
                {secteur.description}
              </p>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default SecteursCards;
