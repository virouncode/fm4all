"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Flag } from "lucide-react";
import { useLocale } from "next-intl";

type LocaleButtonProps = {
  className?: string;
};

const LocaleButton = ({ className }: LocaleButtonProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeLang = (newLocale: "fr" | "en") => {
    router.replace({ pathname }, { locale: newLocale });
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
