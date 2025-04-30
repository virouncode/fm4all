import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";

const CTAContactButtons = () => {
  const t = useTranslations("Global");
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link
          href="https://calendly.com/romuald-fm4all/rdv-fm4all"
          target="_blank"
        >
          {t("contactCtaVisio")}
        </Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="tel:+33669311046">{t("contactCtaTel")}</Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="mailto:contact@fm4all.com">{t("contactCtaMail")}</Link>
      </Button>
    </div>
  );
};

export default CTAContactButtons;
