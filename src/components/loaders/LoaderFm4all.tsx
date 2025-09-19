import Image from "next/image";

type LoaderFm4allProps = {
  src: string;
  alt: string;
};

const LoaderFm4all = ({ src, alt }: LoaderFm4allProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[80px] w-[80px] animate-spin opacity-30">
        <Image src={src} alt={alt} fill sizes="80px" />
      </div>
    </div>
  );
};

export default LoaderFm4all;
