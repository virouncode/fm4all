import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type PreviousButtonProps = {
  handleClickPrevious: () => void;
  className?: string;
};

const PreviousServiceButton = ({
  handleClickPrevious,
  className,
}: PreviousButtonProps) => {
  const t = useTranslations("DevisPage");
  return (
    <Button
      variant="destructive"
      size="lg"
      className={`text-base ${className}`}
      onClick={handleClickPrevious}
    >
      {t("precedent")}
    </Button>
  );
};

export default PreviousServiceButton;
