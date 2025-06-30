import { render, screen } from "@testing-library/react";
import { mockNextIntl, mockUIButton } from "../mocks";

mockUIButton();
mockNextIntl();

vi.mock("lucide-react", () => ({
  Video: () => <span data-testid="icon-video">🎥</span>,
  Phone: () => <span data-testid="icon-phone">📞</span>,
  Mail: () => <span data-testid="icon-mail">📧</span>,
}));

// 👇 Import après les mocks
import CTAContactButtons from "@/components/buttons/cta-contact-buttons";

describe("CTAContactButtons", () => {
  const renderComponent = () => {
    render(<CTAContactButtons />);
    return {
      videoButton: screen.getByRole("button", {
        name: /je prends un rendez-vous en visio/i,
      }),
      phoneButton: screen.getByRole("button", {
        name: /\+33 6 69 31 10 46/i,
      }),
      emailButton: screen.getByRole("button", {
        name: /je contacte par email/i,
      }),
      visioLink: screen.getByRole("link", {
        name: /je prends un rendez-vous en visio/i,
      }),
      phoneLink: screen.getByRole("link", {
        name: /\+33 6 69 31 10 46/i,
      }),
      emailLink: screen.getByRole("link", {
        name: /je contacte par email/i,
      }),
      videoIcon: screen.getByTestId("icon-video"),
      phoneIcon: screen.getByTestId("icon-phone"),
      emailIcon: screen.getByTestId("icon-mail"),
    };
  };
  //Rendering
  it("should render the video call button with French text", () => {
    const { videoButton, visioLink } = renderComponent();
    expect(videoButton).toHaveTextContent(/je prends un rendez-vous en visio/i);
    expect(visioLink).toHaveAttribute(
      "href",
      expect.stringContaining("calendly")
    );
  });

  it("should render the phone button", () => {
    const { phoneButton, phoneLink } = renderComponent();
    expect(phoneButton).toHaveTextContent(/\+33 6 69 31 10 46/i);
    expect(phoneLink).toHaveAttribute("href", "tel:+33669311046");
  });

  it("should render the email button with French text", () => {
    const { emailButton, emailLink } = renderComponent();
    expect(emailButton).toHaveTextContent(/je contacte par email/i);
    expect(emailLink).toHaveAttribute("href", "mailto:contact@fm4all.com");
  });

  // it("should render all three icons", () => {
  //   const { videoIcon, phoneIcon, emailIcon } = renderComponent();
  //   expect(videoIcon).toBeInTheDocument();
  //   expect(phoneIcon).toBeInTheDocument();
  //   expect(emailIcon).toBeInTheDocument();
  // }); PAS BESOIN car getBy renvoie une erreur s'il ne trouve pas
});
