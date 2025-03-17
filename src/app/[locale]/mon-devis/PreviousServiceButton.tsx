import { Button } from "@/components/ui/button";

type PreviousButtonProps = {
  handleClickPrevious: () => void;
  className?: string;
};

const PreviousServiceButton = ({
  handleClickPrevious,
  className,
}: PreviousButtonProps) => {
  return (
    <Button
      variant="destructive"
      size="lg"
      className={`text-base ${className}`}
      onClick={handleClickPrevious}
    >
      Précédent ↑
    </Button>
  );
};

export default PreviousServiceButton;
