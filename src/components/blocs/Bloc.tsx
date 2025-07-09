import { PtComponentsType } from "@/app/[locale]/(site)/blog/[slug]/[subSlug]/page";
import { PortableText } from "next-sanity";
import Image from "next/image";
import {
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
} from "../../../sanity.types";

type BlocProps = {
  imageUrl?: string;
  imageAlt?: string;
  side: "left" | "right";
  bloc: Array<
    | {
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
      }
    | {
        asset?: {
          _ref: string;
          _type: "reference";
          _weak?: boolean;
          [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
        };
        media?: unknown;
        hotspot?: SanityImageHotspot;
        crop?: SanityImageCrop;
        alt?: string;
        _type: "image";
        _key: string;
      }
  >;
  ptComponents?: PtComponentsType;
};

const Bloc = ({ imageUrl, imageAlt, side, bloc, ptComponents }: BlocProps) => {
  return (
    <section className="flex flex-row gap-10 mb-16">
      {imageUrl && side === "left" ? (
        <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
          <Image
            src={imageUrl}
            alt={imageAlt ?? "illustration"}
            quality={100}
            className="object-cover object-center"
            fill={true}
            unoptimized={true}
          />
        </div>
      ) : null}
      <div
        className="flex-1 prose-base
            prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-3xl
            prose-h3:font-bold prose-h3:text-xl prose-h3:ml-10 prose-h3:italic
            prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
            prose-p:max-w-prose prose-p:mx-auto prose-p:text-pretty prose-p:hyphens-auto
            prose-ul:max-w-prose prose-ul:mx-auto prose-ul:flex prose-ul:flex-col prose-ul:gap-4
            prose-li:list-disc prose-li:m-0
            prose-a:underline
            "
      >
        {Array.isArray(bloc) && (
          <PortableText value={bloc} components={ptComponents} />
        )}
      </div>
      {imageUrl && side === "right" ? (
        <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
          <Image
            src={imageUrl}
            alt={imageAlt ?? "illustration"}
            quality={100}
            className="object-cover object-center"
            fill={true}
            unoptimized={true}
          />
        </div>
      ) : null}
    </section>
  );
};

export default Bloc;
