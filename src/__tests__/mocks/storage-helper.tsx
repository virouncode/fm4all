export const setLocalStorageMock = vi.fn();
export const getLocalStorageMock = vi.fn();

export const mockStorageHelper = () => {
  vi.mock("@/lib/utils/storageHelper", () => ({
    setLocalStorage: setLocalStorageMock,
    getLocalStorage: getLocalStorageMock,
  }));
};
