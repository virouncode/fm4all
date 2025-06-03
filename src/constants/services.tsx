import {
  BananaIcon,
  CoffeeIcon,
  CookieIcon,
  CupSodaIcon,
  DropletIcon,
  FireExtinguisherIcon,
  HandPlatterIcon,
  LeafIcon,
  SprayCanIcon,
  ToiletIcon,
  UserRoundCogIcon,
  WrenchIcon,
} from "lucide-react";
import { ReactNode } from "react";

export const servicesMapping: {
  id: number;
  nom: string;
  titre: string;
  icons: ReactNode[];
}[] = [
  {
    id: 1,
    nom: "nettoyage",
    titre: "Nettoyage et propreté",
    icons: [<SprayCanIcon key="spray-can" />],
  },
  {
    id: 2,
    nom: "hygiene",
    titre: "Hygiène sanitaire",
    icons: [<ToiletIcon key="toilet" />],
  },
  {
    id: 3,
    nom: "maintenance",
    titre: "Maintenance",
    icons: [<WrenchIcon key="wrench" />],
  },
  {
    id: 4,
    nom: "securite-incendie",
    titre: "Sécurité incendie",
    icons: [<FireExtinguisherIcon key="fire-extinguisher" />],
  },
  {
    id: 5,
    nom: "cafe",
    titre: "Boissons chaudes",
    icons: [<CoffeeIcon key="coffee" />],
  },
  {
    id: 6,
    nom: "snacks-fruits",
    titre: "Snacks & Fruits",
    icons: [
      <CookieIcon key="cookie" />,
      <BananaIcon key="banana" />,
      <CupSodaIcon key="cup-soda" />,
    ],
  },
  {
    id: 7,
    nom: "fontaines",
    titre: "Fontaines à eau",
    icons: [<DropletIcon key="droplet" />],
  },
  {
    id: 8,
    nom: "office-management",
    titre: "Office/Hospitality Management",
    icons: [<UserRoundCogIcon key="user-round-cog" />],
  },
  {
    id: 9,
    nom: "the",
    titre: "Thés variés",
    icons: [<LeafIcon key="leaf" />],
  },
  {
    id: 10,
    nom: "fm4all",
    titre: "Services fm4all",
    icons: [<HandPlatterIcon key="hand-platter" />],
  },
];
