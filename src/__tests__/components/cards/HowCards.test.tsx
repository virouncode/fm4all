import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

vi.mock("lucide-react", () => ({
  House: () => <span data-testid="icon-house" />,
  HandPlatter: () => <span data-testid="icon-handplatter" />,
  Star: () => <span data-testid="icon-star" />,
  Euro: () => <span data-testid="icon-euro" />,
  ReceiptText: () => <span data-testid="icon-receipttext" />,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "1-mes-locaux": "Mes locaux",
      "je-precise-metres-carres-type-et-effectif":
        "Je précise mètres carrés, type et effectif",
      "2-mes-services": "Mes services",
      "je-selectionne-ce-qui-minteresse-a-la-carte":
        "Je sélectionne ce qui m'intéresse à la carte",
      "3-mes-gammes": "Mes gammes",
      "je-choisis-le-niveau-de-chaque-service":
        "Je choisis le niveau de chaque service",
      "4-mes-prix": "Mes prix",
      "je-compare-en-ligne-mes-prestataires":
        "Je compare en ligne mes prestataires",
      "5-mon-contrat": "Mon contrat",
      "je-valide-la-date-de-demarrage-et-go":
        "Je valide la date de démarrage et go",
    };
    return translations[key] ?? key;
  },
}));

import HowCards from "@/components/cards/HowCards";

describe("HowCards", () => {
  it("renders all HowCards with correct title, content and icons", () => {
    render(<HowCards />);

    expect(screen.getByText("Mes locaux")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Mes gammes")).toBeInTheDocument();
    expect(screen.getByText("Mes prix")).toBeInTheDocument();
    expect(screen.getByText("Mon contrat")).toBeInTheDocument();

    expect(
      screen.getByText("Je précise mètres carrés, type et effectif"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Je sélectionne ce qui m'intéresse à la carte"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Je choisis le niveau de chaque service"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Je compare en ligne mes prestataires"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Je valide la date de démarrage et go"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("icon-house")).toBeInTheDocument();
    expect(screen.getByTestId("icon-handplatter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-star")).toBeInTheDocument();
    expect(screen.getByTestId("icon-euro")).toBeInTheDocument();
    expect(screen.getByTestId("icon-receipttext")).toBeInTheDocument();
  });
});
