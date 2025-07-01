import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House, Star } from "lucide-react";
import { mocki18nNavigation } from "../mocks";

mocki18nNavigation();

import ServicePresentationCard from "@/components/cards/ServicePresentationCard";
let user: ReturnType<typeof userEvent.setup>;

describe("ServicePresentationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  const title = "Service Test";
  const icons = [
    <Star key="star" data-testid="star-icon" />,
    <House key="house" data-testid="house-icon" />,
  ];

  it("renders correctly with href (link case)", () => {
    render(
      <ServicePresentationCard title={title} icons={icons} href="/test" />
    );
    expect(screen.getByRole("link", { name: title })).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    expect(screen.getByTestId("house-icon")).toBeInTheDocument();
  });

  it("renders correctly without href (div only)", () => {
    render(<ServicePresentationCard title={title} icons={icons} />);

    expect(screen.queryByRole("link", { name: title })).not.toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("calls onClick when clicked (without href)", async () => {
    const onClick = vi.fn();
    render(
      <ServicePresentationCard title={title} icons={icons} onClick={onClick} />
    );

    await user.click(screen.getByText(title));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when clicked (with href)", async () => {
    const onClick = vi.fn();
    render(
      <ServicePresentationCard
        title={title}
        icons={icons}
        href="/with-link"
        onClick={onClick}
      />
    );

    await user.click(screen.getByText(title));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
