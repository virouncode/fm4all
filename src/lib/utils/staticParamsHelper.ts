import type { LocaleType, PathnamesType } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function generateLocaleParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateLocalizedRouteParams(paths: PathnamesType[]) {
  return routing.locales.flatMap((locale) =>
    paths.map((path) => {
      const localizedPath = getLocalizedPath(path, locale);
      return {
        locale,
        path: localizedPath.startsWith("/")
          ? localizedPath.substring(1)
          : localizedPath,
      };
    })
  );
}

function getLocalizedPath(path: PathnamesType, locale: LocaleType): string {
  const pathConfig = routing.pathnames[path];
  if (!pathConfig) return path;
  if (typeof pathConfig === "string") return pathConfig;
  return pathConfig[locale] || path;
}

export function generateLocalizedDynamicRouteParams<T extends string>(
  path: PathnamesType,
  slugsFr: (string | undefined)[],
  slugsEn: (string | undefined)[],
  paramName: T
): Array<{ locale: string } & Record<T, string>> {
  return [
    ...slugsFr.map((slug) => {
      return {
        locale: "fr",
        [paramName]: slug,
      } as { locale: string } & Record<T, string>;
    }),
    ...slugsEn.map((slug) => {
      return {
        locale: "en",
        [paramName]: slug,
      } as { locale: string } & Record<T, string>;
    }),
  ];
}
