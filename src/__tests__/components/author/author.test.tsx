import Author from "@/components/author/Author"; // ajuste le chemin si besoin
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

describe("Author", () => {
  const baseProps = {
    prenom: "Jean",
    nom: "Dupont",
    locale: "fr",
    date: "2024-06-15T14:30:00Z",
  };

  it("renders author's full name", () => {
    render(<Author {...baseProps} />);
    expect(screen.getByText(/jean dupont/i)).toBeInTheDocument();
  });

  it.each([
    ["fr", "fr"],
    ["en", "en"],
  ])(
    "renders formatted date based on locale %s if date is provided",
    (locale) => {
      render(<Author {...baseProps} />);
      const expectedDate = DateTime.fromISO(baseProps.date)
        .setLocale(locale)
        .toLocaleString(DateTime.DATETIME_SHORT);
      expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
    },
  );

  it("doesn't render date if date is not provided", () => {
    render(<Author {...baseProps} date={undefined} />);
    const dateSpan = screen.queryByText((_, element) => {
      return element?.tagName === "SPAN";
    });
    expect(dateSpan).not.toBeInTheDocument();
  });

  it("renders portrait if portraitUrl is provided", () => {
    render(
      <Author
        {...baseProps}
        portraitUrl="/avatar.jpg"
        portraitAlt="Portrait de Jean"
      />,
    );
    const img = screen.getByAltText("Portrait de Jean");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.jpg");
  });

  it("doesn't render portrait if portraitUrl is not provided", () => {
    render(<Author {...baseProps} portraitUrl={undefined} />);
    const images = screen.queryAllByRole("img");
    expect(images.length).toBe(0);
  });

  it("uses default alt text if none is provided", () => {
    render(<Author {...baseProps} portraitUrl="/avatar.jpg" />);
    const img = screen.getByAltText("Portrait de l'auteur");
    expect(img).toBeInTheDocument();
  });
});
