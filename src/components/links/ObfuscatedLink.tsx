"use client";

import { Link } from "@/i18n/navigation";
import { PathnamesType } from "@/i18n/routing";
import { PropsWithChildren, useEffect, useState } from "react";

type ObfuscatedLinkProps = {
  href:
    | PathnamesType
    | {
        pathname: "/services/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/secteurs/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/blog/[slug]/[subSlug]";
        params: { slug: string; subSlug: string };
      };
  title: string;
  className?: string;
};

export function ObfuscatedLink({
  href,
  title,
  className,
  children,
}: PropsWithChildren<ObfuscatedLinkProps>) {
  const [realHref, setRealHref] = useState<typeof href | null>(null);

  useEffect(() => {
    setRealHref(href);
  }, [href]);

  if (!realHref) return <span>{children}</span>;

  return (
    <Link
      //@ts-expect-error oui je sais
      href={realHref}
      rel="nofollow"
      className={className}
      title={title}
      aria-label={title}
    >
      {children}
    </Link>
  );
}
