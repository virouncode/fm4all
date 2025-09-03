import { mockNextIntl, useLocaleMock } from "@/__tests__/mocks/next-intl";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

mockNextIntl();

vi.mock("lucide-react", () => ({
  Video: () => <span data-testid="icon-video">🎥</span>,
  Phone: () => <span data-testid="icon-phone">📞</span>,
  Mail: () => <span data-testid="icon-mail">📧</span>,
}));

import CTAContactButtons from "@/components/buttons/cta-contact-buttons";

describe("CTAContactButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const renderComponent = (locale: "fr" | "en" = "fr") => {
    render(<CTAContactButtons />);
    return {
      videoButton: screen.getByRole("button", {
        name:
          locale === "fr"
            ? /je prends un rendez-vous en visio/i
            : /schedule a video call/i,
      }),
      phoneButton: screen.getByRole("button", {
        name: /\+33 6 69 31 10 46/i,
      }),
      emailButton: screen.getByRole("button", {
        name: locale === "fr" ? /je contacte par email/i : /contact by e-mail/i,
      }),
      visioLink: screen.getByRole("link", {
        name:
          locale === "fr"
            ? /je prends un rendez-vous en visio/i
            : /schedule a video call/i,
      }),
      phoneLink: screen.getByRole("link", {
        name: /\+33 6 69 31 10 46/i,
      }),
      emailLink: screen.getByRole("link", {
        name: locale === "fr" ? /je contacte par email/i : /contact by e-mail/i,
      }),
      videoIcon: screen.getByTestId("icon-video"),
      phoneIcon: screen.getByTestId("icon-phone"),
      emailIcon: screen.getByTestId("icon-mail"),
    };
  };
  //Rendering
  it("renders the video call button with French text", () => {
    const { videoButton, visioLink } = renderComponent();
    expect(videoButton).toHaveTextContent(/je prends un rendez-vous en visio/i);
    expect(visioLink).toHaveAttribute(
      "href",
      expect.stringContaining("calendly"),
    );
  });

  it("renders the phone button with French text", () => {
    const { phoneButton, phoneLink } = renderComponent();
    expect(phoneButton).toHaveTextContent(/\+33 6 69 31 10 46/i);
    expect(phoneLink).toHaveAttribute("href", "tel:+33669311046");
  });

  it("renders the email button with French text", () => {
    const { emailButton, emailLink } = renderComponent();
    expect(emailButton).toHaveTextContent(/je contacte par email/i);
    expect(emailLink).toHaveAttribute("href", "mailto:contact@fm4all.com");
  });

  it("renders the video call button with English text", () => {
    useLocaleMock.mockReturnValue("en");
    const { videoButton, visioLink } = renderComponent("en");
    expect(videoButton).toHaveTextContent(/schedule a video call/i);
    expect(visioLink).toHaveAttribute(
      "href",
      expect.stringContaining("calendly"),
    );
  });

  it("renders the phone button with English text", () => {
    useLocaleMock.mockReturnValue("en");
    const { phoneButton, phoneLink } = renderComponent("en");
    expect(phoneButton).toHaveTextContent(/\+33 6 69 31 10 46/i);
    expect(phoneLink).toHaveAttribute("href", "tel:+33669311046");
  });

  it("renders the email button with English text", () => {
    useLocaleMock.mockReturnValue("en");
    const { emailButton, emailLink } = renderComponent("en");
    expect(emailButton).toHaveTextContent(/contact by e-mail/i);
    expect(emailLink).toHaveAttribute("href", "mailto:contact@fm4all.com");
  });

  // it("should render all three icons", () => {
  //   const { videoIcon, phoneIcon, emailIcon } = renderComponent();
  //   expect(videoIcon).toBeInTheDocument();
  //   expect(phoneIcon).toBeInTheDocument();
  //   expect(emailIcon).toBeInTheDocument();
  // }); PAS BESOIN car getBy renvoie une erreur s'il ne trouve pas
});
