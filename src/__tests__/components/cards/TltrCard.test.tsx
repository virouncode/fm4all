import { mocki18nNavigation } from "@/__tests__/mocks/next-i18n";
import { mockNextIntl } from "@/__tests__/mocks/next-intl";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

mockNextIntl();
mocki18nNavigation();

vi.mock("next-sanity", () => ({
  PortableText: (props: { value: unknown }) => {
    return <div data-testid="portable-text-mock" />;
  },
}));

import TltrCard from "@/components/cards/TltrCard";

describe("TltrCard", () => {
  const tltrSample = [
    {
      _type: "block" as const,
      _key: "tltr",
      children: [
        {
          _type: "span" as const,
          _key: "span1",
          text: "Texte tltr",
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the description text", () => {
    render(
      <TltrCard
        description="Description"
        tltr={tltrSample}
        devisButtonTitle="Devis"
        imageUrl="/test.jpg"
        imageAlt="Image test"
      />,
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders the button with correct text", () => {
    render(
      <TltrCard
        description="Description"
        tltr={tltrSample}
        devisButtonTitle="Demander un devis"
        imageUrl="/img.jpg"
        imageAlt="Image devis"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Demander un devis" }),
    ).toBeInTheDocument();
  });

  it("renders the image with correct alt text", () => {
    render(
      <TltrCard
        description="Description"
        tltr={tltrSample}
        devisButtonTitle="Devis"
        imageUrl="/img.jpg"
        imageAlt="Alt test"
      />,
    );

    expect(screen.getByAltText("Alt test")).toBeInTheDocument();
  });

  it("renders the PortableText component", () => {
    render(
      <TltrCard
        description="Description"
        tltr={tltrSample}
        devisButtonTitle="Devis"
        imageUrl="/img.jpg"
        imageAlt="Image alt"
      />,
    );

    expect(screen.getByTestId("portable-text-mock")).toBeInTheDocument();
  });

  it("renders correctly even if tltr is empty", () => {
    render(
      <TltrCard
        description="Empty test"
        tltr={[]}
        devisButtonTitle="Devis"
        imageUrl="/img.jpg"
        imageAlt="Image alt"
      />,
    );

    expect(screen.getByTestId("portable-text-mock")).toBeInTheDocument();
  });
});
