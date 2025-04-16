import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

type UsersAccountsButtonProps = {
  isActive: (href: string) => boolean;
  className?: string;
};
const UsersAccountsButton = ({
  isActive,
  className,
}: UsersAccountsButtonProps) => {
  const t = useTranslations("admin");
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div
          className={`flex gap-1 items-center ${
            isActive("/admin/comptes") || isActive("/admin/signup")
              ? "text-destructive font-bold"
              : ""
          }`}
        >
          <UsersRound size={15} />
          <p>{t("utilisateurs")}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={isActive("/admin/comptes")}>
          <Link href="/admin/comptes" className="!text-base">
            {t("comptes")}
          </Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={isActive("/admin/signup")}>
          <Link href="/admin/signup" className="!text-base">
            {t("creer-un-compte")}
          </Link>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsersAccountsButton;
