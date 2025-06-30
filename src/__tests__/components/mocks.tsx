import { vi } from "vitest";

let currentSearchParams = new URLSearchParams();

export const setSearchParamsMock = (params: Record<string, string>) => {
  currentSearchParams = new URLSearchParams(params);
};

export const paramsMock = vi.fn();
export const mockNextNavigation = () => {
  vi.mock("next/navigation", () => ({
    useParams: paramsMock,
    useSearchParams: () => currentSearchParams,
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

export const setLocalStorageMock = vi.fn();
export const getLocalStorageMock = vi.fn();

export const mockStorageHelper = () => {
  vi.mock("@/lib/utils/storageHelper", () => ({
    setLocalStorage: setLocalStorageMock,
    getLocalStorage: getLocalStorageMock,
  }));
};
