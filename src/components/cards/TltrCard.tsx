import { PortableText } from "next-sanity";
import Image from "next/image";
import DevisButton from "../buttons/devis-button";

type TltrCardProps = {
  description: string;
  tltr: Array<{
    children?: Array<{
      marks?: Array<string>;
      text?: string;
      _type: "span";
      _key: string;
    }>;
    style?:
      | "normal"
      | "h2"
      | "h3"
      | "h4"
      | "essentiel"
      | "confort"
      | "excellence";
    listItem?: "bullet" | "number";
    markDefs?: Array<{
      href?: string;
      _type: "link";
      _key: string;
    }>;
    level?: number;
    _type: "block";
    _key: string;
  }>;
  devisButtonTitle: string;
  imageUrl: string;
  imageAlt: string;
};

const TltrCard = ({
  description,
  tltr,
  devisButtonTitle,
  imageUrl,
  imageAlt,
}: TltrCardProps) => {
  return (
    <section className="flex flex-row gap-10 mb-16 bg-[rgb(250,250,250)] rounded-xl p-6 sm:p-14">
      <div className="flex flex-col flex-1 justify-start text-lg gap-10">
        <div
          className="flex flex-col gap-4 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto prose-p:m-0
          prose-li:list-disc prose-li:m-0
          prose-a:underline"
        >
          <p className="font-bold">{description}</p>
          {Array.isArray(tltr) && <PortableText value={tltr} />}
        </div>
        <div className="flex justify-center">
          <DevisButton
            title={devisButtonTitle}
            text={devisButtonTitle}
            size="lg"
          />
        </div>
      </div>
      <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
        <Image
          src={imageUrl}
          alt={imageAlt}
          quality={100}
          className="object-cover object-center"
          fill={true}
          unoptimized={true}
        />
      </div>
    </section>
  );
};

export default TltrCard;
