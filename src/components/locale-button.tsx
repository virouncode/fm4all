"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "@/i18n/articlesSlugMappings";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  getServicesSlugEn,
  getServicesSlugFr,
} from "@/i18n/servicesSlugMappings";
import { Flag } from "lucide-react";
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

  const handleChangeLang = (newLocale: "fr" | "en") => {
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
          { locale: newLocale }
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
          { locale: newLocale }
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
          { locale: newLocale }
        );
      }
    } else {
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // // are used in combination with a given `pathname`. Since the two will
      // // always match for the current route, we can skip runtime checks.
      router.replace({ pathname, params, query }, { locale: newLocale });
    }
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center gap-1 text-sm hover:opacity-75 cursor-pointer rounded-md border w-16 h-9 justify-center ${className}`}
        >
          <Flag size={14} />
          <span>{locale.toUpperCase()}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {routing.locales.map((l) => (
          <DropdownMenuCheckboxItem
            key={l}
            checked={locale === l}
            onCheckedChange={() => handleChangeLang(l)}
          >
            {l.toUpperCase()}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleButton;
