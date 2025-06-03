import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";

type ServicePresentationCardProps = {
  title: string;
  icons: ReactNode[];
  href?: string | { pathname: string; params: Record<string, string | number> };
  onClick?: () => void;
  className?: string;
};

const ServicePresentationCard = ({
  title,
  icons,
  href,
  onClick,
  className,
}: ServicePresentationCardProps) => {
  return (
    <div
      className={`flex gap-4 items-center p-4 border rounded-xl ${href ? "hover:border-fm4allsecondary hover:text-fm4allsecondary hover:border-2" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">{icons.map((icon) => icon)}</div>
      {href ? (
        //@ts-expect-error oui je sais
        <Link href={href} className="w-full">
          {title}
        </Link>
      ) : (
        <p className={onClick ? "cursor-pointer" : ""}>{title}</p>
      )}
    </div>
  );
};

export default ServicePresentationCard;
