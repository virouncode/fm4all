import { Link } from "@/i18n/navigation";
import { ComponentProps, ReactNode } from "react";

type ServicePresentationCardProps = {
  title: string;
  icons: ReactNode[];
  href?: ComponentProps<typeof Link>["href"];
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
  if (href)
    return (
      <Link href={href} title={title}>
        <div
          className={`flex items-center gap-4 rounded-xl border p-4 ${href ? "hover:border-primary hover:text-primary hover:border-2" : ""} ${className}`}
          onClick={onClick}
        >
          <div className="flex items-center gap-1">
            {icons.map((icon) => icon)}
          </div>
          {title}
        </div>
      </Link>
    );
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 ${href ? "hover:border-primary hover:text-primary hover:border-2" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">{icons.map((icon) => icon)}</div>
      <p className={onClick ? "cursor-pointer" : ""}>{title}</p>
    </div>
  );
};

export default ServicePresentationCard;
