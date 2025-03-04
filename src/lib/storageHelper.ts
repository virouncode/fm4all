import "client-only";

export function getLocalStorage(key: string, defaultValue: string | boolean) {
  const stickyValue = localStorage.getItem(key);

  return stickyValue !== null && stickyValue !== "undefined"
    ? JSON.parse(stickyValue)
    : defaultValue;
}

export function setLocalStorage(key: string, value: string | boolean) {
  localStorage.setItem(key, JSON.stringify(value));
}
