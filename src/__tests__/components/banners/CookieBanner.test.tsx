import { mocki18nNavigation, pathnameMock } from "@/__tests__/mocks/next-i18n";
import { mockNextIntl } from "@/__tests__/mocks/next-intl";
import {
  getLocalStorageMock,
  mockStorageHelper,
  setLocalStorageMock,
} from "@/__tests__/mocks/storage-helper";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

mockNextIntl();
mocki18nNavigation();
mockStorageHelper();
window.gtag = vi.fn();

const mockLocalStorage = (consent: boolean | null, date: number | null) => {
  getLocalStorageMock.mockImplementation((key) => {
    if (key === "cookie_consent") return consent;
    if (key === "cookie_consent_date") return date;
    return null;
  });
};

let user: ReturnType<typeof userEvent.setup>;

import CookieBanner from "@/components/banners/CookieBanner";

describe("CookieBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathnameMock.mockReturnValue("/"); // pas sur la page cookies
    user = userEvent.setup();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  const bannerText =
    "nous-utilisons-des-cookies-et-des-technologies-similaires-necessaires-au-fonctionnement-de-notre-site-web";

  it("renders the banner if no cookie consent", () => {
    mockLocalStorage(null, null);
    render(<CookieBanner />);
    expect(screen.getByText(bannerText)).toBeInTheDocument();
  });

  it("doesn't render the banner if cookieConsent", () => {
    mockLocalStorage(true, Date.now());
    render(<CookieBanner />);
    expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
  });

  it("doesn't render the banner if pathname is /cookies", () => {
    pathnameMock.mockReturnValue("/cookies");
    render(<CookieBanner />);
    expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
  });

  it("accepts consent when clicking on 'Accept'", async () => {
    mockLocalStorage(null, null);
    render(<CookieBanner />);
    const acceptBtn = screen.getByTitle("jaccepte");
    await user.click(acceptBtn);

    await waitFor(() => {
      expect(setLocalStorageMock).toHaveBeenCalledWith("cookie_consent", true);
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
      });
      expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
    });
  });

  it("refuses consent when clicking on 'Refuse'", async () => {
    mockLocalStorage(null, null);
    render(<CookieBanner />);
    const refuseBtn = screen.getByTitle("je-refuse");
    await user.click(refuseBtn);
    await waitFor(() => {
      expect(setLocalStorageMock).toHaveBeenCalledWith("cookie_consent", false);
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });
      expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
    });
  });

  it("renders the banner if cookie consent expired", async () => {
    const oldDate = Date.now() - 1000 * 60 * 60 * 24 * 2; // 2 jours => expire
    mockLocalStorage(true, oldDate);

    const removeItemSpy = vi.spyOn(window.localStorage.__proto__, "removeItem");

    render(<CookieBanner />);

    await waitFor(() => {
      expect(screen.getByText(bannerText)).toBeInTheDocument();
      expect(removeItemSpy).toHaveBeenCalledWith("cookie_consent");
      expect(removeItemSpy).toHaveBeenCalledWith("cookie_consent_date");
    });
  });
  it("doesn't render the banner if cookie consent not expired", async () => {
    const recentDate = Date.now() - 1000 * 60 * 5; // 5 min
    mockLocalStorage(true, recentDate);

    render(<CookieBanner />);
    await waitFor(() => {
      expect(screen.queryByText(bannerText)).not.toBeInTheDocument();
    });
  });
  it("displays the banner if cookie consent is false", () => {
    mockLocalStorage(false, null);
    render(<CookieBanner />);
    expect(screen.getByText(bannerText)).toBeInTheDocument();
  });
});
