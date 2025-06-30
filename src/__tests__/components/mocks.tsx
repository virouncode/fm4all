import { vi } from "vitest";

export const paramsMock = vi.fn();
export const searchParamsMock = () => new URLSearchParams();
export const mockNextNavigation = () => {
  vi.mock("next/navigation", () => ({
    useParams: paramsMock,
    useSearchParams: searchParamsMock,
  }));
};
export const backMock = vi.fn();
export const pushMock = vi.fn();
export const replaceMock = vi.fn();
export const pathnameMock = vi.fn();

export const mocki18nNavigation = () => {
  vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({
      back: backMock,
      push: pushMock,
      replace: replaceMock,
    }),
    usePathname: pathnameMock,
    Link: ({
      href,
      children,
      title,
    }: {
      href: string;
      children: React.ReactNode;
      title?: string;
    }) => (
      <a href={href} title={title} aria-label={title}>
        {children}
      </a>
    ),
  }));
};

export const useLocaleMock = vi.fn(() => "fr"); // "fr" par défaut

export const mockNextIntl = () => {
  vi.mock("next-intl", () => ({
    useLocale: useLocaleMock, // "fr par défaut"
    useTranslations: () => (key: string) => key,
  }));
};
