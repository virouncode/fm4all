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
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <SprayCan />
        </div>
        <p>{t("nettoyage-et-proprete")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Toilet />
        </div>
        <p>{t("hygiene-sanitaire")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Wrench />
        </div>
        <p>{t("maintenance")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <FireExtinguisher />
        </div>
        <p>{t("securite-incendie")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Coffee />
        </div>
        <p>{t("boissons-chaudes")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Leaf />
        </div>
        <p>{t("thes-varies")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Cookie />
          <Banana />
          <CupSoda />
        </div>
        <p>{t("snacks-and-fruits")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Droplet />
        </div>
        <p>{t("fontaines-a-eau")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <UserRoundCog />
        </div>
        <p>{t("office-hospitality-manager")}</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <HandPlatter />
        </div>
        <p>{t("services-fm4all")}</p>
      </div>
    </div>
  );
};

export default MesServicesPresentationCards;
