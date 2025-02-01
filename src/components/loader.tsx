import Image from "next/image";

type LoaderProps = {
  src: string;
  alt: string;
};

const Loader = ({ src, alt }: LoaderProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-[80px] w-[80px] relative animate-spin opacity-30">
        <Image src={src} alt={alt} fill={true} />
      </div>
    </div>
  );
};

export default Loader;
