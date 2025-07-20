import { mocki18nNavigation } from "@/__tests__/mocks/next-i18n";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

mocki18nNavigation();

import ImgCardVertical from "@/components/cards/ImgCardVertical";

describe("ImgCardVertical", () => {
  const baseProps = {
    src: "/image.jpg",
    alt: "Description image",
    href: {
      pathname: "/services/[slug]" as const,
      params: { slug: "nettoyage" },
    },
    linkText: "Voir le service",
  };

  it("renders the image with correct alt and src", () => {
    render(<ImgCardVertical {...baseProps} />);
    const img = screen.getByAltText(baseProps.alt);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", baseProps.src);
  });

  it("renders a normal Link when obfuscated is false and no locale provided", () => {
    render(<ImgCardVertical {...baseProps} />);
    const link = screen.getByRole("link", { name: baseProps.linkText });
    expect(link).toBeInTheDocument();
  });

  it("renders ObfuscatedLink when obfuscated is true", () => {
    render(<ImgCardVertical {...baseProps} obfuscated />);
    const obfLink = screen.getByText(baseProps.linkText);
    expect(obfLink).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <ImgCardVertical {...baseProps}>
        <div data-testid="child-content">Child</div>
      </ImgCardVertical>,
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toHaveTextContent("Child");
  });
});
