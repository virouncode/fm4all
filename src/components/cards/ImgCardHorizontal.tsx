import Image from "next/image";
import { PropsWithChildren } from "react";

type ImgCardHorizontalProps = {
  src: string;
  alt: string;
  className?: string;
};

const ImgCardHorizontal = ({
  src,
  alt,
  className,
  children,
}: PropsWithChildren<ImgCardHorizontalProps>) => {
  return (
    <div className={`flex items-center gap-6 w-[300px] ${className}`}>
      <Image src={src} alt={alt} width={100} height={100} />
      {children}
    </div>
  );
};

export default ImgCardHorizontal;
