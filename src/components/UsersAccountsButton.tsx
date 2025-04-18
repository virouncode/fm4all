import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
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
  const sessionData = useSession().data;
  const user = sessionData?.user;
  const t = useTranslations("admin");
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div
          className={`flex gap-1 items-center ${
            isActive("/admin/[adminId]/comptes") ||
            isActive("/admin/[adminId]/signup")
              ? "text-destructive font-bold"
              : ""
          }`}
        >
          <UsersRound size={15} />
          <p>{t("utilisateurs")}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={isActive("/admin/[adminId]/comptes")}
        >
          <Link
            href={{
              pathname: "/admin/[adminId]/comptes",
              params: { adminId: user?.id ?? 0 },
            }}
            className="!text-base"
          >
            {t("comptes")}
          </Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={isActive("/admin/[adminId]/signup")}>
          <Link
            href={{
              pathname: "/admin/[adminId]/signup",
              params: { adminId: user?.id ?? 0 },
            }}
            className="!text-base"
          >
            {t("creer-un-compte")}
          </Link>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsersAccountsButton;
