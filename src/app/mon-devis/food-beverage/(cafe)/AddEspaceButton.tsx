import { Button } from "@/components/ui/button";

type AddEspaceButtonProps = {
  handleAddEspace: () => void;
};

const AddEspaceButton = ({ handleAddEspace }: AddEspaceButtonProps) => {
  return (
    <Button variant="outline" size="lg" onClick={handleAddEspace}>
      Ajouter un espace café
    </Button>
  );
};

export default AddEspaceButton;
