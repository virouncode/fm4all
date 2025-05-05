import { Link } from "@/i18n/navigation";
import { Slug } from "../../../sanity.types";
import { Button } from "../ui/button";

type TagProps = {
  tag: { _id: string; nom: string; slug: Slug };
};

const TagButton = ({ tag }: TagProps) => {
  return (
    <Button className="rounded-full" variant="outline" size="sm">
      <Link
        href={{
          pathname: "/tag/[slug]",
          params: { slug: tag.slug?.current ?? "" },
        }}
      >
        {tag.nom}
      </Link>
    </Button>
  );
};

export default TagButton;
