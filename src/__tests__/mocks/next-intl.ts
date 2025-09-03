export const useLocaleMock = vi.fn(() => "fr"); // "fr" par défaut

export const mockNextIntl = () => {
  vi.mock("next-intl", () => ({
    useLocale: useLocaleMock, // "fr par défaut"
    useTranslations: () => (key: string) => key,
  }));
};
