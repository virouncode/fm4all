import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
import {
  Banana,
  Coffee,
  Cookie,
  CupSoda,
  Droplet,
  FireExtinguisher,
  HandPlatter,
  Leaf,
  SprayCan,
  Toilet,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";

const MesServicesPresentationCards = () => {
  const t = useTranslations("DevisPage.services.presentation.cards");
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center">
      <ServicePresentationCard
        icons={[<SprayCan key="service-nettoyage" />]}
        title={t("nettoyage-et-proprete")}
      />
      <ServicePresentationCard
        icons={[<Toilet key="service-hygiene-sanitaire" />]}
        title={t("hygiene-sanitaire")}
      />
      <ServicePresentationCard
        icons={[<Wrench key="service-maintenance" />]}
        title={t("maintenance")}
      />
      <ServicePresentationCard
        icons={[<FireExtinguisher key="service-securite-incendie" />]}
        title={t("securite-incendie")}
      />
      <ServicePresentationCard
        icons={[<Coffee key="service-boissons-chaudes" />]}
        title={t("boissons-chaudes")}
      />
      <ServicePresentationCard
        icons={[<Leaf key="service-thes-varies" />]}
        title={t("thes-varies")}
      />
      <ServicePresentationCard
        icons={[
          <Cookie key="service-snacks-and-fruits-cookie" />,
          <Banana key="service-snacks-and-fruits-banana" />,
          <CupSoda key="service-snacks-and-fruits-cup-soda" />,
        ]}
        title={t("snacks-and-fruits")}
      />
      <ServicePresentationCard
        icons={[<Droplet key="service-fontaines-a-eau" />]}
        title={t("fontaines-a-eau")}
      />
      <ServicePresentationCard
        icons={[<UserRoundCog key="service-office-hospitality-manager" />]}
        title={t("office-hospitality-manager")}
      />
      <ServicePresentationCard
        icons={[<HandPlatter key="service-services-fm4all" />]}
        title={t("services-fm4all")}
      />
    </div>
  );
};

export default MesServicesPresentationCards;
