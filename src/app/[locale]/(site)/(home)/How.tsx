import DevisButton from "@/components/buttons/devis-button";
import HowCards from "@/components/cards/HowCards";
import { getTranslations } from "next-intl/server";

const How = async () => {
  const t = await getTranslations("HomePage.comment");
  return (
    <section id="process">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {t("comment-ca-marche")}
        </h2>
        <HowCards />
        <DevisButton
          title={t("demarrez-maintenant")}
          text={t("demarrez-maintenant")}
          size="lg"
          className="self-start mx-auto"
        />
      </div>
    </section>
  );
};

export default How;
