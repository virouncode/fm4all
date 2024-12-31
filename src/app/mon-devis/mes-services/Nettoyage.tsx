import { Button } from "@/components/ui/button";

type NettoyageProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
}: NettoyageProps) => {
  return (
    <div className="flex flex-col gap-10 w-full md:w-3/4 mx-auto h-full" id="1">
      <div className="flex justify-between items-center">
        <p className="text-lg">Nettoyage</p>
        <Button
          onClick={handleClickPrevious}
          size="lg"
          className="text-base"
          variant="destructive"
        >
          Précédent
        </Button>
      </div>
      <Button
        onClick={handleClickNext}
        variant="destructive"
        className="text-base"
        size="lg"
      >
        Suivant
      </Button>
    </div>
  );
};

export default Nettoyage;
