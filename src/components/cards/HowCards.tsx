import { Euro, HandPlatter, House, ReceiptText, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import WhyCard from "./WhyCard";

const HowCards = async () => {
  const t = await getTranslations("HomePage.comment");
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
      <WhyCard
        title={t("1-mes-locaux")}
        content={t("je-precise-metres-carres-type-et-effectif")}
        icon={House}
      />
      <WhyCard
        title={t("2-mes-services")}
        content={t("je-selectionne-ce-qui-minteresse-a-la-carte")}
        icon={HandPlatter}
      />
      <WhyCard
        title={t("3-mes-gammes")}
        content={t("je-choisis-le-niveau-de-chaque-service")}
        icon={Star}
      />
      <WhyCard
        title={t("4-mes-prix")}
        content={t("je-compare-en-ligne-mes-prestataires")}
        icon={Euro}
      />
      <WhyCard
        title={t("5-mon-contrat")}
        content={t("je-valide-la-date-de-demarrage-et-go")}
        icon={ReceiptText}
      />
    </div>
  );
};

export default HowCards;
