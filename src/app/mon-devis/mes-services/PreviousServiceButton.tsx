import { Button } from "@/components/ui/button";

type PreviousButtonProps = {
  handleClickPrevious: () => void;
};

const PreviousServiceButton = ({
  handleClickPrevious,
}: PreviousButtonProps) => {
  return (
    <Button
      variant="destructive"
      size="lg"
      className="text-base"
      onClick={handleClickPrevious}
    >
      Précédent ↑
    </Button>
  );
};

export default PreviousServiceButton;
