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
  titre: string;
};

const TltrCard = ({
  description,
  tltr,
  devisButtonTitle,
  imageUrl,
  imageAlt,
  titre,
}: TltrCardProps) => {
  return (
    <section className="from-primary/100 to-primary/60 mb-16 flex flex-col gap-14 rounded-xl bg-gradient-to-r p-6 text-white sm:p-14">
      <h1 className="text-center text-3xl md:text-4xl">{titre}</h1>
      <div className="flex flex-row gap-10">
        <div className="flex flex-1 flex-col justify-start gap-10 text-lg">
          <div className="prose-base prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl prose-h3:text-xl prose-h3:font-bold prose-p:m-0 prose-p:hyphens-auto prose-p:text-pretty prose-a:underline prose-li:m-0 prose-li:list-disc flex flex-col gap-6">
            <p className="font-bold">{description}</p>
            {Array.isArray(tltr) && <PortableText value={tltr} />}
          </div>
          <div className="flex justify-center">
            <DevisButton
              title={devisButtonTitle}
              text={devisButtonTitle}
              size="lg"
              className="bg-destructive ring-destructive hover:bg-destructive/90 w-full border-none text-white shadow-lg md:w-auto"
            />
          </div>
        </div>
        <div className="relative mx-auto hidden min-h-[400px] flex-1 overflow-hidden rounded-lg md:block">
          <Image
            src={imageUrl}
            alt={imageAlt}
            className="object-cover object-center"
            fill
            sizes="(max-width: 768px) 50vw"
            priority
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};

export default TltrCard;
