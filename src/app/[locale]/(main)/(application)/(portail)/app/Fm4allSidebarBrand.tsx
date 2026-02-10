"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function Fm4allSidebarBrand() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className="mb-4 px-3 pt-3">
      <Link
        href="/app"
        className="hover:bg-muted/50 flex items-center justify-center rounded-md py-2"
        aria-label="FM4ALL"
        title="Dashboard"
      >
        <Image
          src={collapsed ? "/img/logo_simple.webp" : "/img/logo_full.webp"}
          alt="FM4ALL"
          width={140}
          height={32}
          priority
          className="h-7 w-auto object-contain"
        />
      </Link>
    </div>
  );
}
