import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type NextEspaceButtonProps = {
  handleClickNextEspace: () => void;
  disabled: boolean;
};

const NextEspaceButton = ({
  handleClickNextEspace,
  disabled,
}: NextEspaceButtonProps) => {
  const t = useTranslations("DevisPage");
  return (
    <Button
      variant="outline"
      size="sm"
      title={t("espace-suivant")}
      onClick={handleClickNextEspace}
      disabled={disabled}
    >
      {t("espace-suivant-0")}
    </Button>
  );
};

export default NextEspaceButton;
