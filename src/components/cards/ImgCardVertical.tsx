import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { PropsWithChildren } from "react";

type ImgCardVerticalProps = {
  src: string;
  alt: string;
  className?: string;
  href: {
    pathname: "/services/[slug]" | "/secteurs/[slug]";
    params: {
      slug: string;
    };
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
        className={`flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
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
