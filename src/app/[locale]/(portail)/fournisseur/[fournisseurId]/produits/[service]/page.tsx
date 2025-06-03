const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: string; service: string }>;
}) => {
  const { fournisseurId, service } = await params;
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-6 hyphens-auto flex-1">
      <section className="mt-2">
        <h1 className="text-4xl mb-14">Mes produits</h1>
      </section>
    </main>
  );
};

export default page;
