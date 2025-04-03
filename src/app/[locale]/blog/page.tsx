import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "cgu",
    locale,
    locale === "fr" ? "Articles" : "Posts",
    locale === "fr"
      ? "Blog : nos articles sur les services aux entreprises"
      : "Blog: Our posts on business services in Paris"
  );
};

const page = async () => {
  const t = await getTranslations("BlogPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">
          {t("blog-nos-articles-sur-les-services-aux-entreprises")}
        </h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4">
            Nos derniers articles
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4">Par catégorie</h2>
        </div>
      </section>
    </main>
  );
};

export default page;
