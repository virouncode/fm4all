import Image from "next/image";
import { PropsWithChildren } from "react";

type ImgCardVerticalProps = {
  src: string;
  alt: string;
  className?: string;
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
}: PropsWithChildren<ImgCardVerticalProps>) => {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden ${className}`}
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
};

export default ImgCardVertical;
