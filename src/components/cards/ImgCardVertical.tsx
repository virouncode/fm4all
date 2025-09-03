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
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:scale-[99%] hover:shadow-lg ${className}`}
    >
      <div className="relative h-64 w-full">
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
          className="absolute inset-0 z-10 px-4 text-xs italic opacity-0 transition group-hover:opacity-100"
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
          <span className="absolute px-4 text-xs italic opacity-0 transition group-hover:opacity-100">
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
          <span className="absolute px-4 text-xs italic opacity-0 transition group-hover:opacity-100">
            {linkText}
          </span>
        </Link>
      )}
    </div>
  );
};

export default ImgCardVertical;
