import DevisButton from "@/components/buttons/devis-button";
import HowCards from "@/components/cards/HowCards";
import { useTranslations } from "next-intl";

const How = () => {
  const t = useTranslations("HomePage.comment");
  return (
    <section id="process">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-8 pb-12">
        <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
          {t("comment-ca-marche")}
        </h2>
        <HowCards />
        <DevisButton
          title={t("demarrez-maintenant")}
          text={t("demarrez-maintenant")}
          size="lg"
          className="mx-auto"
        />
      </div>
    </section>
  );
};

export default How;
