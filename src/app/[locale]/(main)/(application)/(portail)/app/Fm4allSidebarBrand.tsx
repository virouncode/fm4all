"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function Fm4allSidebarBrand() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <div className="mb-2 px-3 pt-2">
      <Link
        href="/app"
        className="hover:bg-muted/50 flex items-center justify-center rounded-md py-1"
        aria-label="FM4ALL"
        title="Dashboard"
      >
        <Image
          src={collapsed ? "/img/logo_simple.webp" : "/img/logo_full.webp"}
          alt="FM4ALL"
          width={120}
          height={28}
          priority
          className="h-5 w-auto object-contain"
        />
      </Link>
    </div>
  );
}
