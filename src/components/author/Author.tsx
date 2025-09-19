import { DateTime } from "luxon";
import { useLocale } from "next-intl";
import Image from "next/image";

type AuthorProps = {
  portraitUrl?: string;
  portraitAlt?: string;
  prenom: string;
  nom: string;
  date?: string;
};

const Author = ({
  portraitUrl,
  portraitAlt,
  prenom,
  nom,
  date,
}: AuthorProps) => {
  const locale = useLocale();
  return (
    <div className="mb-10 flex items-center justify-end gap-4">
      {portraitUrl ? (
        <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
          <Image
            src={portraitUrl}
            alt={portraitAlt ?? "Portrait de l'auteur"}
            className="object-cover object-center"
            fill
            sizes="40px"
          />
        </div>
      ) : null}
      <p>
        {prenom} {nom},{" "}
        {date ? (
          <span>
            {DateTime.fromISO(date)
              .setLocale(locale)
              .toLocaleString(DateTime.DATETIME_SHORT)}
          </span>
        ) : null}
      </p>
    </div>
  );
};

export default Author;
