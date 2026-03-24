// Since we have a root `not-found.tsx` page, a layout file

import type { Metadata } from "next";
import { ReactNode } from "react";

// is required, even if it's just passing children through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fm4all.com"),
};
