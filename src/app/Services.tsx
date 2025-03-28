import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import ServicesCarousel from "./ServicesCarousel";

const Services = () => {
  const tHeader = useTranslations("header");
  const t = useTranslations("HomePage.services");
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {tHeader("nos-services")}
        </h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
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
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        {t("voir-tous-les-services")}
      </Link>
    </section>
  );
};

export default Services;
