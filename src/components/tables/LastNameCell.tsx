import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CellContext } from "@tanstack/react-table";
import { Stethoscope } from "lucide-react";

type SelectUserType = {
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
};

const LastNameCell = ({ row }: CellContext<SelectUserType, unknown>) => {
  const user = row.original as SelectUserType;

  // Initiales pour fallback
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="bg-muted/60 h-9 w-9 rounded-full border">
        {user.image && (
          <AvatarImage
            src={user.image}
            alt={`${user.firstName} ${user.lastName}`}
          />
        )}
        <AvatarFallback className="bg-primary/5 text-primary rounded-full">
          <div className="flex h-full w-full items-center justify-center">
            {initials ? (
              <span className="text-xs font-semibold">{initials}</span>
            ) : (
              <Stethoscope className="h-4 w-4" />
            )}
          </div>
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.lastName}</span>
    </div>
  );
};

export default LastNameCell;
