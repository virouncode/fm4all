"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LangContext } from "@/context/LangProvider";
import { Flag } from "lucide-react";
import { useContext } from "react";

type LangButtonProps = {
  className?: string;
};

const LangButton = ({ className }: LangButtonProps) => {
  const { lang, setLang } = useContext(LangContext);
  const handleChangeLang = (lang: string) => {
    setLang(lang as "fr" | "en");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={`flex items-center gap-1 text-sm hover:opacity-75 cursor-pointer rounded-md border w-16 h-9 justify-center ${className}`}
        >
          <Flag size={14} />
          <span>{lang.toUpperCase()}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={lang === "fr"}
          onCheckedChange={() => handleChangeLang("fr")}
        >
          FR
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={lang === "en"}
          onCheckedChange={() => handleChangeLang("en")}
        >
          EN
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LangButton;
