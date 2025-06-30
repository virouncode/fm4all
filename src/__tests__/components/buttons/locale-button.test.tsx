import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  mocki18nNavigation,
  mockNextIntl,
  mockNextNavigation,
  paramsMock,
  pathnameMock,
  replaceMock,
  useLocaleMock,
} from "../mocks";

mocki18nNavigation();
mockNextNavigation();
mockNextIntl();

import LocaleButton from "@/components/buttons/locale-button";

describe("LocaleButton", () => {
  beforeEach(() => {
    vi.clearAllMocks(); //
  });
  it("switches from fr to en and updates slug correctly for services", async () => {
    pathnameMock.mockReturnValue("/services/[slug]");
    paramsMock.mockReturnValue({ slug: "nettoyage" });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/services/[slug]",
        params: { slug: "cleaning-services" },
        query: {},
      },
      { locale: "en" }
    );
  });
  it("switches from fr to en and updates slug correctly for sectors", async () => {
    pathnameMock.mockReturnValue("/secteurs/[slug]");
    paramsMock.mockReturnValue({
      slug: "gestion-services-facility-bureaux-paris",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/secteurs/[slug]",
        params: {
          slug: "outsourced-facility-services-management-for-office-users-in-paris-area-france",
        },
        query: {},
      },
      { locale: "en" }
    );
  });
  it("switches from fr to en and updates slug correctly for blog", async () => {
    pathnameMock.mockReturnValue("/blog/[slug]");
    paramsMock.mockReturnValue({
      slug: "pilotage-facility-management",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/blog/[slug]",
        params: {
          slug: "facilities-management-outsourcing",
        },
        query: {},
      },
      { locale: "en" }
    );
  });
  it("switches from fr to en and updates slug and subSlug correctly for blog", async () => {
    pathnameMock.mockReturnValue("/blog/[slug]/[subSlug]");
    paramsMock.mockReturnValue({
      slug: "pilotage-facility-management",
      subSlug: "le-fm-c-est-quoi",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/blog/[slug]/[subSlug]",
        params: {
          slug: "facilities-management-outsourcing",
          subSlug: "what-is-fm",
        },
        query: {},
      },
      { locale: "en" }
    );
  });
  it("switches from en to fr and updates slug correctly for services", async () => {
    useLocaleMock.mockReturnValue("en");
    pathnameMock.mockReturnValue("/services/[slug]");
    paramsMock.mockReturnValue({ slug: "cleaning-services" });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/services/[slug]",
        params: { slug: "nettoyage" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug correctly for sectors", async () => {
    useLocaleMock.mockReturnValue("en");
    pathnameMock.mockReturnValue("/secteurs/[slug]");
    paramsMock.mockReturnValue({
      slug: "outsourced-facility-services-management-for-office-users-in-paris-area-france",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/secteurs/[slug]",
        params: { slug: "gestion-services-facility-bureaux-paris" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug correctly for blog", async () => {
    useLocaleMock.mockReturnValue("en");
    pathnameMock.mockReturnValue("/blog/[slug]");
    paramsMock.mockReturnValue({
      slug: "facilities-management-outsourcing",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/blog/[slug]",
        params: { slug: "pilotage-facility-management" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug and subSlug correctly for blog", async () => {
    useLocaleMock.mockReturnValue("en");
    pathnameMock.mockReturnValue("/blog/[slug]/[subSlug]");
    paramsMock.mockReturnValue({
      slug: "facilities-management-outsourcing",
      subSlug: "what-is-fm",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(replaceMock).toHaveBeenCalledWith(
      {
        pathname: "/blog/[slug]/[subSlug]",
        params: {
          slug: "pilotage-facility-management",
          subSlug: "le-fm-c-est-quoi",
        },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("does not call replace if new locale is the same as current", async () => {
    useLocaleMock.mockReturnValue("fr");
    pathnameMock.mockReturnValue("/services/[slug]");
    paramsMock.mockReturnValue({ slug: "nettoyage" });

    render(<LocaleButton />);
    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
