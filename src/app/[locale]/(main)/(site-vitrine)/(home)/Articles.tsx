import ArticlesCarousel from "@/components/carousel/ArticlesCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const Articles = () => {
  const t = useTranslations("HomePage.articles");
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
          {t("nos-derniers-articles")}
        </h2>
        <Button
          variant="outline"
          className="hidden items-center justify-center text-base md:flex"
          title={t("tous-les-articles")}
          size="lg"
          asChild
        >
          <Link href="/blog">{t("tous-les-articles")}</Link>
        </Button>
      </div>
      <ArticlesCarousel />
      <Link href="/blog" className="text-primary underline md:hidden">
        {t("voir-tous-les-articles")}
      </Link>
    </section>
  );
};

export default Articles;
