import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type RetirerEspaceButtonProps = {
  handleClickRemove: () => void;
  espaceId: number;
  disabled: boolean;
  all: boolean;
};

const RetirerEspaceButton = ({
  handleClickRemove,
  espaceId,
  disabled,
  all,
}: RetirerEspaceButtonProps) => {
  return (
    <Button
      variant="destructive"
      size="sm"
      title="Retirer"
      onClick={handleClickRemove}
      type="button"
      disabled={disabled}
    >
      <Trash2 />
      {all ? "Retirer tous les espaces" : `Retirer espace n°${espaceId}`}
    </Button>
  );
};

export default RetirerEspaceButton;
