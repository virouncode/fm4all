import { Button } from "@/components/ui/button";

type AddLotButtonProps = {
  handleAddLot: () => void;
};

const AddLotButton = ({ handleAddLot }: AddLotButtonProps) => {
  return (
    <Button variant="outline" size="lg" onClick={handleAddLot}>
      Ajouter une/des machine(s)
    </Button>
  );
};

export default AddLotButton;
