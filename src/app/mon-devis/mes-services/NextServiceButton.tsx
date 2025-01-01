import { Button } from "@/components/ui/button";

type NextServiceButtonProps = {
  handleClickNext: () => void;
};

const NextServiceButton = ({ handleClickNext }: NextServiceButtonProps) => {
  return (
    <div className="text-end">
      <Button
        variant="destructive"
        size="lg"
        className="text-base"
        onClick={handleClickNext}
      >
        Suivant ↓
      </Button>
    </div>
  );
};

export default NextServiceButton;
