import DevisBreadcrumb from "../DevisBreadcrumb";
import Total from "../Total";

export default function SauvegarderMaProgressionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-4 px-6 pb-10 pt-4 md:px-20">
      <DevisBreadcrumb />
      {children}
      <Total />
    </main>
  );
}
