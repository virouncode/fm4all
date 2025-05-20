import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import Image from "next/image";
import { PropsWithChildren } from "react";

type ImgCardVerticalProps = {
  src: string;
  alt: string;
  className?: string;
  href:
    | {
        pathname: "/services/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/secteurs/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/blog/[slug]/[subSlug]";
        params: { slug: string; subSlug: string };
      };

  locale?: LocaleType;
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
  href,
  locale,
}: PropsWithChildren<ImgCardVerticalProps>) => {
  const cardContent = (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[99%] transition-all ${className}`}
    >
      <div className="w-full h-64 relative mx-auto">
        <Image
          src={src}
          alt={alt}
          fill
          quality={100}
          className="object-cover object-center"
          unoptimized={true}
        />
      </div>
      {children}
    </div>
  );
  return locale ? (
    <Link href={href} locale={locale}>
      {cardContent}
    </Link>
  ) : (
    <Link href={href}>{cardContent}</Link>
  );
};

export default ImgCardVertical;
