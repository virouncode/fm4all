import { Button } from "@/components/ui/button";

type AddEspaceButtonProps = {
  handleAddEspace: () => void;
  title?: string;
};

const AddEspaceButton = ({ handleAddEspace, title }: AddEspaceButtonProps) => {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleAddEspace}
      data-testid="add-espace-button"
    >
      {title}
    </Button>
  );
};

export default AddEspaceButton;
