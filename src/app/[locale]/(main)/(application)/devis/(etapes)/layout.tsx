export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pt-4 pb-10 md:px-20 lg:h-[calc(100vh-4rem)]">
      {/* <DevisBreadcrumb />
      <div className="lg:relative">
        <Total />
      </div>
      {children}
      <CacheInvalidationListener /> */}
      <div>
        Cette partie du site est en maintenance. Veuillez revenir plus tard.
        <br />
        This part of the website is under maintenance, please come back later.
      </div>
    </main>
  );
}
