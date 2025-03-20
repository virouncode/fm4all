"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEquivalentPath } from "@/lib/routes";
import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import { Flag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type LocaleButtonProps = {
  className?: string;
};

const LocaleButton = ({ className }: LocaleButtonProps) => {
  const locale = useCurrentLocale() as "fr" | "en";
  const changeLocale = useChangeLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeLang = (newLocale: "fr" | "en") => {
    // First, change the locale for next-international
    changeLocale(newLocale);

    // Then, navigate to the equivalent URL in the new language
    // Extract the path without locale
    const pathnameSegments = pathname.split("/").filter(Boolean);
    if (pathnameSegments.length > 0) {
      // Remove the locale segment
      const pathWithoutLocale = "/" + pathnameSegments.slice(1).join("/");

      // Find the equivalent path in the new locale
      const equivalentPath = getEquivalentPath(pathWithoutLocale, newLocale);

      // Navigate to the new URL
      if (equivalentPath) {
        router.push(`/${newLocale}${equivalentPath}`);
      }
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
        <DropdownMenuCheckboxItem
          checked={locale === "fr"}
          onCheckedChange={() => handleChangeLang("fr")}
        >
          FR
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={locale === "en"}
          onCheckedChange={() => handleChangeLang("en")}
        >
          EN
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleButton;
