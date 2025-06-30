import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocki18nNavigation, mockNextIntl, mockUIButton } from "../mocks";

mockUIButton();
mocki18nNavigation();
mockNextIntl();

vi.mock("lucide-react", () => ({
  Phone: () => <span data-testid="phone-icon">📞</span>,
}));

// Import the component after mocking its dependencies
import ContactButton from "@/components/buttons/contact-button";
import { Dispatch, SetStateAction } from "react";

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
  //Rendering
  // it("should render a contact link and a phone icon", () => {
  //déjà vérifié par getByRole
  // });
  it("should render a link with the correct href", () => {
    const { link } = renderComponent(() => {});
    expect(link).toHaveAttribute("href", "/contact");
  });
  //Interaction
  it("should call setIsMobileNavOpen when clicked", async () => {
    const setIsMobileNavOpen = vi.fn();
    const { button } = renderComponent(setIsMobileNavOpen);
    const user = userEvent.setup();
    await user.click(button);
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
  });
});
