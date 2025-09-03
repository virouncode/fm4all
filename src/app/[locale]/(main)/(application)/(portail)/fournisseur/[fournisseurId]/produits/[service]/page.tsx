const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string; service: string }>;
}) => {
  const { fournisseurId, service } = await params;
  return (
    <main className="mx-auto mb-24 max-w-7xl flex-1 hyphens-auto px-6 py-4 md:px-6">
      <section className="mt-2">
        <h1 className="mb-14 text-4xl">Mes produits</h1>
      </section>
    </main>
  );
};

export default page;
