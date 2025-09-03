import UnauthorizedCard from "./UnauthorizedCard";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ type: string | null }>;
}) => {
  const { type } = await searchParams;
  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <UnauthorizedCard type={type} />
      </section>
    </main>
  );
};

export default page;
