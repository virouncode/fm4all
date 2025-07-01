import { Euro, HandPlatter, House, ReceiptText, Star } from "lucide-react";
import WhyCard from "./WhyCard";
import { useTranslations } from "next-intl";

const HowCards = () => {
  const t = useTranslations("HomePage.comment");
  const howCardsData = [
    {
      title: t("1-mes-locaux"),
      content: t("je-precise-metres-carres-type-et-effectif"),
      icon: House,
    },
    {
      title: t("2-mes-services"),
      content: t("je-selectionne-ce-qui-minteresse-a-la-carte"),
      icon: HandPlatter,
    },
    {
      title: t("3-mes-gammes"),
      content: t("je-choisis-le-niveau-de-chaque-service"),
      icon: Star,
    },
    {
      title: t("4-mes-prix"),
      content: t("je-compare-en-ligne-mes-prestataires"),
      icon: Euro,
    },
    {
      title: t("5-mon-contrat"),
      content: t("je-valide-la-date-de-demarrage-et-go"),
      icon: ReceiptText,
    },
  ];
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
      {howCardsData.map(({ title, content, icon: Icon }) => (
        <WhyCard key={title} title={title} content={content} icon={Icon} />
      ))}
    </div>
  );
};

export default HowCards;
