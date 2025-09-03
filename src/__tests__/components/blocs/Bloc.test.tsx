import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

vi.mock("next-sanity", () => ({
  PortableText: (props: { value: unknown; components?: unknown }) => {
    return <div data-testid="portable-text-mock" />;
  },
}));

import Bloc from "@/components/blocs/Bloc"; // adapte le chemin réel

describe("Bloc", () => {
  const sampleBloc = [
    {
      _type: "block" as const,
      _key: "block1",
      children: [
        {
          _type: "span" as const,
          _key: "span1",
          text: "Texte de test",
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an image on the left if side = left", () => {
    render(
      <Bloc
        imageUrl="/image.jpg"
        imageAlt="Image gauche"
        side="left"
        bloc={sampleBloc}
      />,
    );
    const img = screen.getByAltText("Image gauche");
    expect(img).toBeInTheDocument();
  });

  it("renders an image on the right if side = right", () => {
    render(
      <Bloc
        imageUrl="/image.jpg"
        imageAlt="Image droite"
        side="right"
        bloc={sampleBloc}
      />,
    );

    const img = screen.getByAltText("Image droite");
    expect(img).toBeInTheDocument();
  });

  it("doesn't render an image if no imageUrl", () => {
    render(<Bloc side="left" bloc={sampleBloc} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the portable text component", () => {
    render(
      <Bloc
        imageUrl="/img.jpg"
        imageAlt="Texte test"
        side="left"
        bloc={sampleBloc}
      />,
    );
    // Ici on cherche notre mock via data-testid
    expect(screen.getByTestId("portable-text-mock")).toBeInTheDocument();
  });

  it("displays alt text placeholder if no imageAlt", () => {
    render(<Bloc imageUrl="/img.jpg" side="left" bloc={sampleBloc} />);
    expect(screen.getByAltText("illustration")).toBeInTheDocument();
  });

  it("renders the portable text component, even if bloc is empty", () => {
    render(<Bloc imageUrl="/img.jpg" side="left" bloc={[]} />);
    expect(screen.getByTestId("portable-text-mock")).toBeInTheDocument();
  });
});
