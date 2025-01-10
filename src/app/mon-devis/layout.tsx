import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";

export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 h-[calc(100vh-4rem)] flex flex-col gap-4">
      <DevisBreadcrumb />
      {children}
    </main>
  );
}
