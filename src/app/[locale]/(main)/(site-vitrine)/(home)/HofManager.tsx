import { ObfuscatedLink } from "@/components/links/ObfuscatedLink";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getArticle } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../../../../sanity.types";

const HofManager = async () => {
  const t = await getTranslations("HomePage.hofManager");
  const locale = await getLocale();
  const article = await getArticle(
    locale === "fr"
      ? "hof-managers-un-nouveau-concept"
      : "hof-managers-a-new-concept",
  );
  const categorie = article.categorie as ArticleCategory;
  return (
    article.subSlug?.current &&
    categorie.slug?.current && (
      <section className="bg-hof-img hidden h-[600px] bg-cover bg-no-repeat md:block">
        <div className="mx-auto flex h-full w-full max-w-7xl items-end rounded-lg p-6">
          <Card className="mb-10 ml-10 w-1/3">
            <CardHeader>
              <CardTitle>
                <h3 className="text-4xl"></h3>
              </CardTitle>
              <CardDescription>
                <h2 className="border-l-2 px-4 text-3xl">
                  {t("hof-managers")}
                </h2>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-base">{article.description}</p>
              <Button
                variant="outline"
                title={t("decouvrir-loffre")}
                className="flex items-center justify-center text-base"
                size="default"
                asChild
              >
                <ObfuscatedLink
                  href={{
                    pathname: "/blog/[slug]/[subSlug]",
                    params: {
                      slug: categorie.slug.current,
                      subSlug: article.subSlug.current,
                    },
                  }}
                >
                  {t("decouvrir-loffre")}
                </ObfuscatedLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  );
};

export default HofManager;
