import "client-only";

export function getLocalStorage(
  key: string,
  defaultValue: string | boolean | null
) {
  const stickyValue = localStorage.getItem(key);
  console.log("stickyValue", stickyValue);

  return stickyValue !== null && stickyValue !== "undefined"
    ? JSON.parse(stickyValue)
    : defaultValue;
}

export function setLocalStorage(key: string, value: string | number | boolean) {
  localStorage.setItem(key, JSON.stringify(value));
}
