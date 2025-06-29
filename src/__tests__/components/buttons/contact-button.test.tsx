import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("lucide-react", () => ({
  Phone: () => <span data-testid="phone-icon">Phone</span>,
}));

// Import the component after mocking its dependencies
import ContactButton from "@/components/buttons/contact-button";

describe("ContactButton", () => {
  it("should render a contact link", () => {
    const { container } = render(
      <ContactButton setIsMobileNavOpen={() => {}} />
    );
    expect(container.querySelector("a[href='/contact']")).not.toBeNull();
  });
  it("should call setIsMobileNavOpen when clicked", () => {
    const setIsMobileNavOpen = vi.fn();
    const { getByRole } = render(
      <ContactButton setIsMobileNavOpen={setIsMobileNavOpen} />
    );
    const button = getByRole("button");
    button.click();
    expect(setIsMobileNavOpen).toHaveBeenCalledWith(false);
  });
});
