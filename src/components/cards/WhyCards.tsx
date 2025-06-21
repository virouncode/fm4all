import WhyCard from "@/components/cards/WhyCard";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

type WhyCardProps = {
  className?: string;
};

const WhyCards = ({ className }: WhyCardProps) => {
  const t = useTranslations("HomePage.pourquoi");
  const whyCardsData = [
    {
      title: t("simplicite"),
      content: t(
        "3-gammes-de-services-standardisees-pour-une-comparaison-et-un-choix-faciles"
      ),
      icon: Feather,
    },
    {
      title: t("rapidite"),
      content: t(
        "devis-personnalises-en-ligne-en-quelques-minutes-pret-a-demarrer"
      ),
      icon: Rabbit,
    },
    {
      title: t("fiabilite"),
      content: t(
        "contrats-clairs-et-partenaires-de-confiance-rigoureusement-selectionnes"
      ),
      icon: Handshake,
    },
    {
      title: t("serenite"),
      content: t(
        "centralisation-des-demandes-du-suivi-qualite-et-des-escalades-pour-une-tranquillite-desprit-garantie"
      ),
      icon: Waves,
    },
    {
      title: t("optimise"),
      content: t("10-en-moyenne-grace-aux-offres-groupees-de-nos-partenaires"),
      icon: Euro,
    },
  ];
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 ${className}`}
    >
      {whyCardsData.map(({ title, content, icon: Icon }) => (
        <WhyCard key={title} title={title} content={content} icon={Icon} />
      ))}
    </div>
  );
};

export default WhyCards;
