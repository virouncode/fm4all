import type { Locale, PathnamesType } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function generateLocaleParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateLocalizedRouteParams(paths: PathnamesType[]) {
  return routing.locales.flatMap((locale) =>
    paths.map((path) => {
      const localizedPath = getLocalizedPath(path, locale as Locale);
      return {
        locale,
        path: localizedPath.startsWith("/")
          ? localizedPath.substring(1)
          : localizedPath,
      };
    })
  );
}

function getLocalizedPath(path: PathnamesType, locale: Locale): string {
  const pathConfig = routing.pathnames[path];
  if (!pathConfig) return path;
  if (typeof pathConfig === "string") return pathConfig;
  return pathConfig[locale] || path;
}

export function generateLocalizedDynamicRouteParams<T extends string>(
  path: PathnamesType,
  slugs: string[],
  paramName: T
): Array<{ locale: string } & Record<T, string>> {
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => {
      return {
        locale,
        [paramName]: slug,
      } as { locale: string } & Record<T, string>;
    })
  );
}

/**
 * Example usage for blog slugs:
 *
 * // In src/app/[locale]/blog/[slug]/page.tsx
 * export async function generateStaticParams() {
 *   const slugs = await fetchAllBlogSlugs();
 *   return generateLocalizedDynamicRouteParams('/blog/[slug]', slugs, 'slug');
 * }
 */
