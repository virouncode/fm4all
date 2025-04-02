import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type PreviousEspaceButtonProps = {
  handleClickPreviousEspace: () => void;
};

const PreviousEspaceButton = ({
  handleClickPreviousEspace,
}: PreviousEspaceButtonProps) => {
  const t = useTranslations("DevisPage");
  return (
    <Button
      variant="outline"
      size="sm"
      title={t("espace-precedent")}
      type="button"
      onClick={handleClickPreviousEspace}
    >
      {t("espace-precedent-0")}
    </Button>
  );
};

export default PreviousEspaceButton;
