import { Button } from "@/components/ui/button";

type NextServiceButtonProps = {
  handleClickNext: () => void;
  disabled?: boolean;
};

const NextServiceButton = ({
  handleClickNext,
  disabled = false,
}: NextServiceButtonProps) => {
  return (
    <div className="text-center lg:text-end">
      <Button
        variant="destructive"
        size="lg"
        className="text-base"
        onClick={handleClickNext}
        disabled={disabled}
      >
        Suivant ↓
      </Button>
    </div>
  );
};

export default NextServiceButton;
