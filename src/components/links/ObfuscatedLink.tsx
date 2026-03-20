"use client";

import { useRouter } from "@/i18n/navigation";

type ObfuscatedLinkProps = {
  href: Parameters<ReturnType<typeof useRouter>["push"]>[0];

  children: React.ReactNode;
  className?: string;
};

export function ObfuscatedLink({
  href,
  children,
  className,
}: ObfuscatedLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    // e.preventDefault();
    router.push(href);
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className={`focus-visible:ring-primary cursor-pointer hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`}
      title={typeof children === "string" ? children : undefined}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
