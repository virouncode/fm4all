import { mocki18nNavigation } from "@/__tests__/mocks/next-i18n";
import { mockNextIntl } from "@/__tests__/mocks/next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dispatch, SetStateAction } from "react";
import { describe, expect, it } from "vitest";

mocki18nNavigation();
mockNextIntl();
vi.mock("lucide-react", () => ({
  Phone: () => <span data-testid="phone-icon">📞</span>,
}));

//!!!!!!!!!!!! Import the component after mocking its dependencies !!!!!!!!!!!!!
// This ensures that the mocked versions are used in the component.
import ContactButton from "@/components/buttons/contact-button";

describe("ContactButton", () => {
  const renderComponent = (
    setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>
  ) => {
    render(<ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />);
    return {
      link: screen.getByRole("link", { name: /nous-contacter/i }),
      button: screen.getByRole("button"),
      phoneIcon: screen.getByTestId("phone-icon"),
    };
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a link with the correct href", () => {
    const { link } = renderComponent(() => {});
    expect(link).toHaveAttribute("href", "/contact");
  });
  it("calls setIsMobileNavOpen when clicked", async () => {
    const setIsMobileNavOpen = vi.fn();
    const { button } = renderComponent(setIsMobileNavOpen);
    const user = userEvent.setup();
    await user.click(button);
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
  });
});
