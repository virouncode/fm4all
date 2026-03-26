"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LocaleType, routing } from "@/i18n/routing";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "@/redirects/articlesSlugMappings";
import {
  getSecteurSlugEn,
  getSecteurSlugFr,
} from "@/redirects/secteursSlugMappings";
import {
  getServicesSlugEn,
  getServicesSlugFr,
  getServicesSubSlugEn,
  getServicesSubSlugFr,
} from "@/redirects/servicesSlugMappings";
import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

type LocaleButtonProps = {
  className?: string;
};

const LocaleButton = ({ className }: LocaleButtonProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const handleChangeLang = (newLocale: LocaleType) => {
    if (newLocale === locale) return;
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    if (pathname === "/services/[slug]") {
      if (typeof params.slug === "string") {
        const newSlug =
          newLocale === "fr"
            ? getServicesSlugFr(params.slug)
            : getServicesSlugEn(params.slug);
        router.replace(
          { pathname, params: { slug: newSlug }, query },
          { locale: newLocale },
        );
      }
    } else if (pathname === "/services/[slug]/[subSlug]") {
      if (
        typeof params.slug === "string" &&
        typeof params.subSlug === "string"
      ) {
        const newSlug =
          newLocale === "fr"
            ? getServicesSlugFr(params.slug)
            : getServicesSlugEn(params.slug);
        const newSubSlug =
          newLocale === "fr"
            ? getServicesSubSlugFr(params.subSlug)
            : getServicesSubSlugEn(params.subSlug);
        router.replace(
          { pathname, params: { slug: newSlug, subSlug: newSubSlug }, query },
          { locale: newLocale },
        );
      }
    } else if (pathname === "/blog/[slug]") {
      if (typeof params.slug === "string") {
        const newSlug =
          newLocale === "fr"
            ? getArticlesSlugFr(params.slug)
            : getArticlesSlugEn(params.slug);
        router.replace(
          { pathname, params: { slug: newSlug }, query },
          { locale: newLocale },
        );
      }
    } else if (pathname === "/blog/[slug]/[subSlug]") {
      if (
        typeof params.slug === "string" &&
        typeof params.subSlug === "string"
      ) {
        const newSlug =
          newLocale === "fr"
            ? getArticlesSlugFr(params.slug)
            : getArticlesSlugEn(params.slug);
        const newSubSlug =
          newLocale === "fr"
            ? getArticlesSubSlugFr(params.subSlug)
            : getArticlesSubSlugEn(params.subSlug);
        router.replace(
          { pathname, params: { slug: newSlug, subSlug: newSubSlug }, query },
          { locale: newLocale },
        );
      }
    } else if (pathname === "/secteurs/[slug]") {
      if (typeof params.slug === "string") {
        const newSlug =
          newLocale === "fr"
            ? getSecteurSlugFr(params.slug)
            : getSecteurSlugEn(params.slug);
        router.replace(
          { pathname, params: { slug: newSlug }, query },
          { locale: newLocale },
        );
      }
    } else {
      router.replace(
        { pathname, params, query } as Parameters<typeof router.replace>[0],
        { locale: newLocale },
      );
    }
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`flex h-9 w-16 items-center justify-center gap-1 rounded-md border text-sm hover:opacity-75 ${className}`}
          aria-label={locale === "fr" ? "Changer de langue" : "Change language"}
          variant="outline"
          title={locale === "fr" ? "Changer de langue" : "Change language"}
          data-testid="locale-button"
        >
          {locale === "fr" ? "🇫🇷" : "🇬🇧"} {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {routing.locales.map((l) => (
          <DropdownMenuCheckboxItem
            key={l}
            checked={locale === l}
            onCheckedChange={() => handleChangeLang(l)}
            className="text-base"
            data-testid={`locale-${l}`}
          >
            {l === "fr" ? "🇫🇷" : "🇬🇧"} {l.toUpperCase()}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleButton;
