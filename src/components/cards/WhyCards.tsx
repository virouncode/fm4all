import WhyCard from "@/components/cards/WhyCard";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

type WhyCardProps = {
  className?: string;
};

const WhyCards = ({ className }: WhyCardProps) => {
  const t = useTranslations("HomePage.pourquoi");
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 ${className}`}
    >
      <WhyCard
        title={t("simplicite")}
        content={t(
          "3-gammes-de-services-standardisees-pour-une-comparaison-et-un-choix-faciles"
        )}
        icon={Feather}
      />
      <WhyCard
        title={t("rapidite")}
        content={t(
          "devis-personnalises-en-ligne-en-quelques-minutes-pret-a-demarrer"
        )}
        icon={Rabbit}
      />
      <WhyCard
        title={t("fiabilite")}
        content={t(
          "contrats-clairs-et-partenaires-de-confiance-rigoureusement-selectionnes"
        )}
        icon={Handshake}
      />
      <WhyCard
        title={t("serenite")}
        content={t(
          "centralisation-des-demandes-du-suivi-qualite-et-des-escalades-pour-une-tranquillite-desprit-garantie"
        )}
        icon={Waves}
      />
      <WhyCard
        title={t("optimise")}
        content={t(
          "10-en-moyenne-grace-aux-offres-groupees-de-nos-partenaires"
        )}
        icon={Euro}
      />
    </div>
  );
};

export default WhyCards;
