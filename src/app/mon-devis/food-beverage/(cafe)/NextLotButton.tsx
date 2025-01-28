import { Button } from "@/components/ui/button";

type NextLotButtonProps = {
  handleClickNextLot: () => void;
  disabled: boolean;
};

const NextLotButton = ({
  handleClickNextLot,
  disabled,
}: NextLotButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClickNextLot}
      disabled={disabled}
    >
      Machine(s) suivante(s) ↓
    </Button>
  );
};

export default NextLotButton;
