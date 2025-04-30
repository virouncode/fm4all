import Image from "next/image";

type LoaderFm4allProps = {
  src: string;
  alt: string;
};

const LoaderFm4all = ({ src, alt }: LoaderFm4allProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-[80px] w-[80px] relative animate-spin opacity-30">
        <Image src={src} alt={alt} fill={true} />
      </div>
    </div>
  );
};

export default LoaderFm4all;
