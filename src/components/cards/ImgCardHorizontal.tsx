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
      <div className="h-[80px] w-[80px] relative">
        <Image src={src} alt={alt} fill={true} />
      </div>
      {children}
    </div>
  );
};

export default ImgCardHorizontal;
