import { Link } from "@/i18n/navigation";
import React from "react";

type ServicePresentationCardProps = {
  title: string;
  icon: React.ReactNode;
  href?: string | { pathname: string; params: Record<string, string | number> };
};

const ServicePresentationCard = ({
  title,
  icon,
  href,
}: ServicePresentationCardProps) => {
  return (
    <div
      className={`flex gap-4 items-center p-4 border rounded-xl ${href ? "hover:border-fm4allsecondary hover:text-fm4allsecondary hover:border-2" : ""}`}
    >
      <div className="flex items-center gap-1">{icon}</div>
      {href ? (
        //@ts-expect-error oui je sais
        <Link href={href} className="w-full">
          {title}
        </Link>
      ) : (
        <p>{title}</p>
      )}
    </div>
  );
};

export default ServicePresentationCard;
