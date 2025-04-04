import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type RetirerEspaceButtonProps = {
  handleClickRemove: () => void;
  espaceId: number;
  disabled: boolean;
  all: boolean;
};

const RetirerEspaceButton = ({
  handleClickRemove,
  espaceId,
  disabled,
  all,
}: RetirerEspaceButtonProps) => {
  const t = useTranslations("DevisPage.foodBeverage.cafe");
  return (
    <Button
      variant="destructive"
      size="sm"
      title={t("retirer")}
      onClick={handleClickRemove}
      type="button"
      disabled={disabled}
    >
      <Trash2 />
      {all
        ? t("retirer-tous-les-espaces")
        : t("retirer-espace-n-espaceid", { espaceId })}
    </Button>
  );
};

export default RetirerEspaceButton;
