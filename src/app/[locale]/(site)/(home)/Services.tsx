import ServicesCarousel from "@/components/carousel/ServicesCarousel";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const Services = () => {
  const t = useTranslations("HomePage.services");
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
          {t("nos-services")}
        </h2>
        <Button
          variant="outline"
          className="hidden items-center justify-center text-base md:flex"
          title={t("tous-les-services")}
          size="lg"
          asChild
        >
          <Link href="/services">{t("tous-les-services")}</Link>
        </Button>
      </div>
      <ServicesCarousel />
      <Link
        href="/services"
        className="text-fm4allsecondary underline md:hidden"
      >
        {t("voir-tous-les-services")}
      </Link>
    </section>
  );
};

export default Services;
