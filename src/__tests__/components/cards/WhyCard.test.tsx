import { render, screen } from "@testing-library/react";
import { House } from "lucide-react";
import { describe, expect, it } from "vitest";

vi.mock("lucide-react", () => ({
  House: () => <span data-testid="house-icon">House</span>,
}));

import WhyCard from "@/components/cards/WhyCard";

describe("WhyCard", () => {
  const title = "Titre de test";
  const content = "Contenu de test";

  it("renders the title and content correctly", () => {
    render(<WhyCard title={title} content={content} icon={House} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it("renders the icon component", () => {
    render(<WhyCard title={title} content={content} icon={House} />);
    const houseIcon = screen.getByTestId("house-icon");
    expect(houseIcon).toBeInTheDocument();
  });
});
