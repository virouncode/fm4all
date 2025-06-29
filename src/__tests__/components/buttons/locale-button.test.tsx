import LocaleButton from "@/components/buttons/locale-button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { describe, expect, it, vi, type Mock } from "vitest";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LocaleButton", () => {
  it("switches from fr to en and updates slug correctly for services", async () => {
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("fr");
    (usePathname as Mock).mockReturnValue("/services/[slug]");
    (useParams as Mock).mockReturnValue({ slug: "nettoyage" });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(mockReplace).toHaveBeenCalledWith(
      {
        pathname: "/services/[slug]",
        params: { slug: "cleaning-services" },
        query: {},
      },
      { locale: "en" }
    );
  });
  it("switches from fr to en and updates slug correctly for sectors", async () => {
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("fr");
    (usePathname as Mock).mockReturnValue("/secteurs/[slug]");
    (useParams as Mock).mockReturnValue({
      slug: "gestion-services-facility-bureaux-paris",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(mockReplace).toHaveBeenCalledWith(
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
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("fr");
    (usePathname as Mock).mockReturnValue("/blog/[slug]");
    (useParams as Mock).mockReturnValue({
      slug: "pilotage-facility-management",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(mockReplace).toHaveBeenCalledWith(
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
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("fr");
    (usePathname as Mock).mockReturnValue("/blog/[slug]/[subSlug]");
    (useParams as Mock).mockReturnValue({
      slug: "pilotage-facility-management",
      subSlug: "le-fm-c-est-quoi",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const enOption = screen.getByText("🇬🇧 EN");
    await userEvent.click(enOption);

    expect(mockReplace).toHaveBeenCalledWith(
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
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("en");
    (usePathname as Mock).mockReturnValue("/services/[slug]");
    (useParams as Mock).mockReturnValue({ slug: "cleaning-services" });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(mockReplace).toHaveBeenCalledWith(
      {
        pathname: "/services/[slug]",
        params: { slug: "nettoyage" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug correctly for sectors", async () => {
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("en");
    (usePathname as Mock).mockReturnValue("/secteurs/[slug]");
    (useParams as Mock).mockReturnValue({
      slug: "outsourced-facility-services-management-for-office-users-in-paris-area-france",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(mockReplace).toHaveBeenCalledWith(
      {
        pathname: "/secteurs/[slug]",
        params: { slug: "gestion-services-facility-bureaux-paris" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug correctly for blog", async () => {
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("en");
    (usePathname as Mock).mockReturnValue("/blog/[slug]");
    (useParams as Mock).mockReturnValue({
      slug: "facilities-management-outsourcing",
    });

    render(<LocaleButton />);

    const button = screen.getByRole("button", { name: "Change language" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);

    expect(mockReplace).toHaveBeenCalledWith(
      {
        pathname: "/blog/[slug]",
        params: { slug: "pilotage-facility-management" },
        query: {},
      },
      { locale: "fr" }
    );
  });
  it("switches from en to fr and updates slug and subSlug correctly for blog", async () => {
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("en");
    (usePathname as Mock).mockReturnValue("/blog/[slug]/[subSlug]");
    (useParams as Mock).mockReturnValue({
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

    expect(mockReplace).toHaveBeenCalledWith(
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
    const mockReplace = vi.fn();
    (useRouter as Mock).mockReturnValue({ replace: mockReplace });
    (useLocale as Mock).mockReturnValue("fr");
    (usePathname as Mock).mockReturnValue("/services/[slug]");
    (useParams as Mock).mockReturnValue({ slug: "nettoyage" });

    render(<LocaleButton />);
    const button = screen.getByRole("button", { name: "Changer de langue" });
    await userEvent.click(button);

    const options = screen.getAllByRole("menuitemcheckbox");
    const frOption = options.find((el) => el.textContent?.includes("🇫🇷 FR"));
    if (!frOption) throw new Error("FR option not found");
    await userEvent.click(frOption);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
