import CacheInvalidationListener from "@/components/cache/CacheInvalidationListener";
import DevisBreadcrumb from "../DevisBreadcrumb";
import Total from "../Total";

export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-10 pt-4 md:px-20 lg:h-[calc(100vh-4rem)]">
      <DevisBreadcrumb />
      <div className="lg:relative">
        <Total />
      </div>
      {children}
      <CacheInvalidationListener />
    </main>
  );
}
