import DevisBreadcrumb from "../DevisBreadcrumb";
import Total from "../Total";

export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6 pb-10 md:px-20 lg:h-[calc(100vh-4rem)] flex flex-col gap-4">
      <DevisBreadcrumb />
      <div className="lg:relative">
        <Total />
      </div>
      {children}
    </main>
  );
}
