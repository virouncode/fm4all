import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { Slug } from "../../../sanity.types";
import { Button } from "../ui/button";

type TagProps = {
  tag: { _id: string; nom: string; slug: Slug };
  locale: LocaleType;
};

const TagButton = ({ tag, locale }: TagProps) => {
  return (
    <Button className="rounded-full" variant="outline" size="sm">
      <Link
        href={{
          pathname: "/tag/[slug]",
          params: { slug: tag.slug?.current ?? "" },
        }}
        locale={locale}
      >
        {tag.nom}
      </Link>
    </Button>
  );
};

export default TagButton;
