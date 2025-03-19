"use client";

import { RouteKey, routes } from "@/lib/routes";
import { useCurrentLocale } from "@/locales/client";
import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";

// Omit the href prop from LinkProps and replace it with our custom routeKey prop
type LocalizedLinkProps = Omit<LinkProps, "href"> & {
  href: RouteKey;
};

/**
 * A wrapper around Next.js Link component that automatically handles localized routes
 * The href prop only accepts values of type RouteKey defined in routes.ts
 */
const LocalizedLink = ({
  href: routeKey,
  children,
  ...props
}: PropsWithChildren<LocalizedLinkProps>) => {
  // Get the current locale
  const locale = useCurrentLocale();
  const localizedPath = routes[routeKey][locale];

  return (
    <Link href={`/${locale}${localizedPath}`} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedLink;
