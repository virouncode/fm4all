"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import { Flag } from "lucide-react";

type LocaleButtonProps = {
  className?: string;
};

const LocaleButton = ({ className }: LocaleButtonProps) => {
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  // const { lang, setLang } = useContext(LangContext);
  const handleChangeLang = (lang: "fr" | "en") => {
    changeLocale(lang);
    // setLang
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
