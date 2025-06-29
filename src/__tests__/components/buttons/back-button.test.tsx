import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
// Mock the dependencies
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

const backMock = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));
// Import the component after mocking its dependencies
import BackButton from "@/components/buttons/back-button";

describe("BackButton", () => {
  it("should render a button with 'Retour' text", () => {
    const { getByText } = render(<BackButton title="Retour" />);
    expect(getByText("Retour")).toBeInTheDocument();
  });

  it("should call router.back when clicked", () => {
    const { getByRole } = render(<BackButton title="Retour" />);
    const button = getByRole("button");
    button.click();
    expect(backMock).toHaveBeenCalled();
  });
});
