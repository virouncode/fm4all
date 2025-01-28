import { Button } from "@/components/ui/button";

type PreviousLotButtonProps = {
  handleClickPreviousLot: () => void;
};

const PreviousLotButton = ({
  handleClickPreviousLot,
}: PreviousLotButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      title="Machine précédente"
      type="button"
      onClick={handleClickPreviousLot}
    >
      Machine(s) précédente(s) ↑
    </Button>
  );
};

export default PreviousLotButton;
