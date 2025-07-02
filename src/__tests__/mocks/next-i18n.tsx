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
