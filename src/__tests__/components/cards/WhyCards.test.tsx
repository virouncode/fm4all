import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Feather: () => <span data-testid="icon-feather" />,
  Rabbit: () => <span data-testid="icon-rabbit" />,
  Handshake: () => <span data-testid="icon-handshake" />,
  Waves: () => <span data-testid="icon-waves" />,
  Euro: () => <span data-testid="icon-euro" />,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      simplicite: "Simplicité",
      "3-gammes-de-services-standardisees-pour-une-comparaison-et-un-choix-faciles":
        "Contenu Simplicité",
      rapidite: "Rapidité",
      "devis-personnalises-en-ligne-en-quelques-minutes-pret-a-demarrer":
        "Contenu Rapidité",
      fiabilite: "Fiabilité",
      "contrats-clairs-et-partenaires-de-confiance-rigoureusement-selectionnes":
        "Contenu Fiabilité",
      serenite: "Sérénité",
      "centralisation-des-demandes-du-suivi-qualite-et-des-escalades-pour-une-tranquillite-desprit-garantie":
        "Contenu Sérénité",
      optimise: "Optimisé",
      "10-en-moyenne-grace-aux-offres-groupees-de-nos-partenaires":
        "Contenu Optimisé",
    };
    return translations[key] ?? key;
  },
}));

import WhyCards from "@/components/cards/WhyCards";

describe("WhyCards", () => {
  it("renders all cards with correct titles, contents, and icons", () => {
    render(<WhyCards />);

    expect(screen.getByText("Simplicité")).toBeInTheDocument();
    expect(screen.getByText("Rapidité")).toBeInTheDocument();
    expect(screen.getByText("Fiabilité")).toBeInTheDocument();
    expect(screen.getByText("Sérénité")).toBeInTheDocument();
    expect(screen.getByText("Optimisé")).toBeInTheDocument();

    expect(screen.getByText("Contenu Simplicité")).toBeInTheDocument();
    expect(screen.getByText("Contenu Rapidité")).toBeInTheDocument();
    expect(screen.getByText("Contenu Fiabilité")).toBeInTheDocument();
    expect(screen.getByText("Contenu Sérénité")).toBeInTheDocument();
    expect(screen.getByText("Contenu Optimisé")).toBeInTheDocument();

    expect(screen.getByTestId("icon-feather")).toBeInTheDocument();
    expect(screen.getByTestId("icon-rabbit")).toBeInTheDocument();
    expect(screen.getByTestId("icon-handshake")).toBeInTheDocument();
    expect(screen.getByTestId("icon-waves")).toBeInTheDocument();
    expect(screen.getByTestId("icon-euro")).toBeInTheDocument();
  });
});
