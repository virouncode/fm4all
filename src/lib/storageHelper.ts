import "client-only";

export function getSessionStorage(
  key: string,
  defaultValue: string | boolean | null
) {
  const stickyValue = sessionStorage.getItem(key);

  return stickyValue !== null && stickyValue !== "undefined"
    ? JSON.parse(stickyValue)
    : defaultValue;
}

export function setSessionStorage(
  key: string,
  value: string | number | boolean
) {
  sessionStorage.setItem(key, JSON.stringify(value));
}
