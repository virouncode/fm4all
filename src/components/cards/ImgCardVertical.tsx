import { Link } from "@/i18n/navigation";
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
  obfuscated?: boolean;
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
};

const ImgCardVertical = ({
  src,
  alt,
  className,
  children,
  href,
  linkText,
  obfuscated = false,
  priority = false,
  fetchPriority = "auto",
}: PropsWithChildren<ImgCardVerticalProps>) => {
  return (
    <div
      className={`group bg-card text-card-foreground relative flex flex-col gap-4 overflow-hidden rounded-xl border shadow transition-all hover:scale-[99%] hover:shadow-lg ${className}`}
    >
      <div className="relative h-64 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          fetchPriority={fetchPriority}
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
