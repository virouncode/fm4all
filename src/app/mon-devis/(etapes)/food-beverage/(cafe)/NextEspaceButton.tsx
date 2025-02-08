import { Button } from "@/components/ui/button";

type NextEspaceButtonProps = {
  handleClickNextEspace: () => void;
  disabled: boolean;
};

const NextEspaceButton = ({
  handleClickNextEspace,
  disabled,
}: NextEspaceButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClickNextEspace}
      disabled={disabled}
    >
      Espace suivant ↓
    </Button>
  );
};

export default NextEspaceButton;
