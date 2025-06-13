"use client";

import { useRouter } from "@/i18n/navigation";

type ObfuscatedLinkProps = {
  href:
    | "/"
    | "/secteurs"
    | { pathname: "/secteurs/[slug]"; params: { slug: string } }
    | "/blog"
    | { pathname: "/blog/[slug]"; params: { slug: string } }
    | {
        pathname: "/blog/[slug]/[subSlug]";
        params: { slug: string; subSlug: string };
      }
    | "/gammes"
    | "/engagements"
    | "/partenaires"
    | "/faq"
    | "/prestataire"
    | "/contact"
    | "/mentions"
    | "/confidentialite"
    | "/cookies"
    | "/cgv"
    | "/cgu"
    | { pathname: "/admin/[adminId]/dashboard"; params: { adminId: string } }
    | { pathname: "/client/[clientId]/dashboard"; params: { clientId: string } }
    | {
        pathname: "/fournisseur/[fournisseurId]/dashboard";
        params: { fournisseurId: string };
      }
    | "/auth/signin";
  children: React.ReactNode;
  className?: string;
};

export function ObfuscatedLink({
  href,
  children,
  className,
}: ObfuscatedLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:opacity-80  ${className}`}
      title={children as string}
      aria-label={children as string}
    >
      {children}
    </span>
  );
}
