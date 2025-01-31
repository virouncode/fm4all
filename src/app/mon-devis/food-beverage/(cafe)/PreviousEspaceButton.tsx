import { Button } from "@/components/ui/button";

type PreviousEspaceButtonProps = {
  handleClickPreviousEspace: () => void;
};

const PreviousEspaceButton = ({
  handleClickPreviousEspace,
}: PreviousEspaceButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      title="Espace précédent"
      type="button"
      onClick={handleClickPreviousEspace}
    >
      Espace précédent ↑
    </Button>
  );
};

export default PreviousEspaceButton;
