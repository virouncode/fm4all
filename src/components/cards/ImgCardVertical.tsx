import { Link } from "@/i18n/navigation";
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
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
  href,
}: PropsWithChildren<ImgCardVerticalProps>) => {
  return (
    <Link href={href}>
      <div
        className={`flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[101%] transition-all ${className}`}
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
    </Link>
  );
};

export default ImgCardVertical;
