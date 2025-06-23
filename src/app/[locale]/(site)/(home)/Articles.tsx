import ArticlesCarousel from "@/components/carousel/ArticlesCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const Articles = () => {
  const t = useTranslations("HomePage.articles");
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {t("nos-derniers-articles")}
        </h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
          title={t("tous-les-articles")}
          size="lg"
          asChild
        >
          <Link href="/blog">{t("tous-les-articles")}</Link>
        </Button>
      </div>
      <ArticlesCarousel />
      <Link
        href="/blog"
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        {t("voir-tous-les-articles")}
      </Link>
    </section>
  );
};

export default Articles;
