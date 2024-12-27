import Image from "next/image";
import { PropsWithChildren } from "react";

type ImgCardVerticalProps = {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
  width,
  height,
}: PropsWithChildren<ImgCardVerticalProps>) => {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden ${className}`}
    >
      <div>
        <Image src={src} alt={alt} width={width} height={height} />
      </div>

      {children}
    </div>
  );
};

export default ImgCardVertical;
