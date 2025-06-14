import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import Image from "next/image";
import { PropsWithChildren } from "react";
import { ObfuscatedLink } from "../links/ObfuscatedLink";

type ImgCardVerticalProps = {
  src: string;
  alt: string;
  href:
    | {
        pathname: "/services/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/secteurs/[slug]";
        params: { slug: string };
      }
    | {
        pathname: "/blog/[slug]/[subSlug]";
        params: { slug: string; subSlug: string };
      };
  linkText: string;
  className?: string;
  locale?: LocaleType;
  obfuscated?: boolean;
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
  href,
  linkText,
  locale,
  obfuscated = false,
}: PropsWithChildren<ImgCardVerticalProps>) => {
  return (
    <div
      className={`relative group flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow overflow-hidden transition-all hover:shadow-lg hover:scale-[99%] ${className}`}
    >
      <div className="w-full h-64 relative">
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

      {/* Lien invisible en overlay */}
      {obfuscated ? (
        <ObfuscatedLink
          className="absolute inset-0 z-10 px-4 text-xs opacity-0 group-hover:opacity-100 transition italic"
          href={href}
        >
          {linkText}
        </ObfuscatedLink>
      ) : locale ? (
        <Link
          href={href}
          locale={locale}
          title={linkText}
          aria-label={linkText}
          className="absolute inset-0 z-10"
        >
          {/* <span className="text-xs absolute -top-5 text-white">{linkText}</span> */}
          <span className="absolute bottom-1 px-4 text-xs opacity-0 group-hover:opacity-100 transition italic">
            {linkText}
          </span>
        </Link>
      ) : (
        <Link
          href={href}
          title={linkText}
          aria-label={linkText}
          className="absolute inset-0 z-10"
        >
          <span className="text-xs absolute -top-5 text-white">{linkText}</span>
        </Link>
      )}
    </div>
  );
};

export default ImgCardVertical;
