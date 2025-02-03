import { Button } from "@/components/ui/button";

type AddEspaceButtonProps = {
  handleAddEspace: () => void;
  title?: string;
};

const AddEspaceButton = ({
  handleAddEspace,
  title = "café",
}: AddEspaceButtonProps) => {
  return (
    <Button variant="outline" size="lg" onClick={handleAddEspace}>
      Ajouter un espace {title}
    </Button>
  );
};

export default AddEspaceButton;
