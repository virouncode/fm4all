import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { backMock, mocki18nNavigation } from "../mocks";

mocki18nNavigation();

import BackButton from "@/components/buttons/back-button";

describe("BackButton", () => {
  const renderComponent = () => {
    render(<BackButton title="Retour" />);
    return {
      button: screen.getByRole("button", { name: /retour/i }),
    };
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //Rendering
  it("should render a button with the right text", () => {
    const { button } = renderComponent();
    expect(button).toHaveTextContent(/retour/i);
  });
  //Interaction
  it("should call router.back when clicked", async () => {
    const { button } = renderComponent();
    const user = userEvent.setup();
    await user.click(button);
    expect(backMock).toHaveBeenCalled();
  });
});
