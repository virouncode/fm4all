import { Button } from "./ui/button";

type TagProps = {
  nom: string;
};

const Tag = ({ nom }: TagProps) => {
  return (
    <Button className="rounded-full" variant="outline" size="sm">
      {nom}
    </Button>
  );
};

export default Tag;
