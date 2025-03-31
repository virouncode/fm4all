import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type NextServiceButtonProps = {
  handleClickNext: () => void;
  disabled?: boolean;
};

const NextServiceButton = ({
  handleClickNext,
  disabled = false,
}: NextServiceButtonProps) => {
  const t = useTranslations("DevisPage");
  return (
    <div className="text-center lg:text-end">
      <Button
        variant="destructive"
        size="lg"
        className="text-base"
        onClick={handleClickNext}
        disabled={disabled}
      >
        {t("suivant")}
      </Button>
    </div>
  );
};

export default NextServiceButton;
