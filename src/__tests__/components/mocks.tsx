import { vi } from "vitest";

export const mockUIButton = () => {
  vi.mock("@/components/ui/button", () => ({
    Button: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) => <button onClick={onClick}>{children}</button>,
  }));
};

export const paramsMock = vi.fn();
export const searchParamsMock = vi.fn();
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

export const mockNextIntl = () => {
  vi.mock("next-intl", () => ({
    useLocale: () => "fr", // "fr par défaut"
    useTranslations: () => (key: string) => key,
  }));
};
