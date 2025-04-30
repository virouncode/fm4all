import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getArticle } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../../../sanity.types";

const HofManager = async () => {
  const t = await getTranslations("HomePage.hofManager");
  const locale = await getLocale();
  const article = await getArticle(
    locale === "fr"
      ? "hof-managers-un-nouveau-concept"
      : "hof-managers-a-new-concept"
  );
  const categorie = article.categorie as ArticleCategory;
  return (
    <section className="hidden md:block bg-hof-img bg-cover bg-no-repeat h-[600px]">
      <div className="h-full max-w-7xl w-full mx-auto  p-6 rounded-lg flex items-end">
        <Card className="w-1/3 ml-10 mb-10">
          <CardHeader>
            <CardTitle>
              <h3 className="text-4xl"></h3>
            </CardTitle>
            <CardDescription>
              <h2 className="text-3xl border-l-2 px-4">{t("hof-managers")}</h2>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-6">{article.description}</p>
            <Button
              variant="outline"
              title={t("decouvrir-loffre")}
              className="flex justify-center items-center text-base"
              size="default"
              asChild
            >
              <Link
                href={{
                  pathname: "/blog/[slug]/[subSlug]",
                  params: {
                    slug: categorie.slug?.current ?? "",
                    subSlug: article.subSlug?.current ?? "",
                  },
                }}
              >
                {t("decouvrir-loffre")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HofManager;
