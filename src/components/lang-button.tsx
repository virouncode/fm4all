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
import { useContext } from "react";
import { Button } from "./ui/button";

const LangButton = () => {
  const { lang, setLang } = useContext(LangContext);
  const handleChangeLang = (lang: string) => {
    setLang(lang as "fr" | "en");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {lang.toUpperCase()}
        </Button>
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
