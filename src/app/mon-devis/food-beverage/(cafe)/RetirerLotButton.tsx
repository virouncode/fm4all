import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type RetirerLotButtonProps = {
  handleClickRemove: () => void;
  lotId: number;
  disabled: boolean;
  all: boolean;
};

const RetirerLotButton = ({
  handleClickRemove,
  lotId,
  disabled,
  all,
}: RetirerLotButtonProps) => {
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
      {all ? "Retirer tous les lots" : `Retirer lot n°${lotId}`}
    </Button>
  );
};

export default RetirerLotButton;
