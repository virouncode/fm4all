import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// 🔧 Mock des dépendances
vi.mock("next-intl", () => ({
  useLocale: () => "fr", // tu peux aussi tester "en" si tu veux
}));

vi.mock("lucide-react", () => ({
  Video: () => <span data-testid="icon-video">🎥</span>,
  Phone: () => <span data-testid="icon-phone">📞</span>,
  Mail: () => <span data-testid="icon-mail">📧</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

// 👇 Import après les mocks
import CTAContactButtons from "@/components/buttons/cta-contact-buttons";

describe("CTAContactButtons", () => {
  it("renders the video call button with French text", () => {
    render(<CTAContactButtons />);
    expect(
      screen.getByRole("button", {
        name: /je prends un rendez-vous en visio/i,
      })
    ).toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: /je prends un rendez-vous en visio/i,
    });
    expect(link).toHaveAttribute("href", expect.stringContaining("calendly"));
  });

  it("renders the phone button", () => {
    render(<CTAContactButtons />);
    const phoneButton = screen.getByRole("button", {
      name: /\+33 6 69 31 10 46/i,
    });
    expect(phoneButton).toBeInTheDocument();

    const phoneLink = screen.getByRole("link", {
      name: /\+33 6 69 31 10 46/i,
    });
    expect(phoneLink).toHaveAttribute("href", "tel:+33669311046");
  });

  it("renders the email button with French text", () => {
    render(<CTAContactButtons />);
    const emailButton = screen.getByRole("button", {
      name: /je contacte par email/i,
    });
    expect(emailButton).toBeInTheDocument();

    const emailLink = screen.getByRole("link", {
      name: /je contacte par email/i,
    });
    expect(emailLink).toHaveAttribute("href", "mailto:contact@fm4all.com");
  });

  it("renders all three icons", () => {
    render(<CTAContactButtons />);
    expect(screen.getByTestId("icon-video")).toBeInTheDocument();
    expect(screen.getByTestId("icon-phone")).toBeInTheDocument();
    expect(screen.getByTestId("icon-mail")).toBeInTheDocument();
  });
});
