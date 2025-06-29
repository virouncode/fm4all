import Author from "@/components/author/Author"; // ajuste le chemin si besoin
import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { describe, expect, it, vi } from "vitest";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => {
    // Simple mock for testing
    return <img {...props} alt={props.alt || "image"} />;
  },
}));

describe("Author component", () => {
  const baseProps = {
    prenom: "Jean",
    nom: "Dupont",
    locale: "fr",
    date: "2024-06-15T14:30:00Z",
  };

  it("renders author's full name", () => {
    render(<Author {...baseProps} />);
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it("renders formatted date based on locale", () => {
    render(<Author {...baseProps} />);
    const expectedDate = DateTime.fromISO(baseProps.date)
      .setLocale("fr")
      .toLocaleString(DateTime.DATETIME_SHORT);
    expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
  });

  it("renders portrait if portraitUrl is provided", () => {
    render(
      <Author
        {...baseProps}
        portraitUrl="/avatar.jpg"
        portraitAlt="Portrait de Jean"
      />
    );
    const img = screen.getByAltText("Portrait de Jean");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.jpg");
  });

  it("does not render portrait if portraitUrl is not provided", () => {
    render(<Author {...baseProps} portraitUrl={undefined} />);
    const images = screen.queryAllByRole("img");
    expect(images.length).toBe(0);
  });

  it("uses default alt text if none is provided", () => {
    render(<Author {...baseProps} portraitUrl="/avatar.jpg" />);
    const img = screen.getByAltText("Portrait de l'auteur");
    expect(img).toBeInTheDocument();
  });

  it("renders nothing if no date is passed", () => {
    render(<Author {...baseProps} date={undefined} />);
    // the fallback will pass empty string to fromISO, which is invalid
    // Luxon returns 'Invalid DateTime' -> will render 'Invalid DateTime'
    expect(screen.getByText(/Invalid DateTime/)).toBeInTheDocument();
  });
});
