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
