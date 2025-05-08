import UnauthorizedCard from "./UnauthorizedCard";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ type: string | null }>;
}) => {
  const { type } = await searchParams;
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20">
      <section className="flex items-center justify-center h-full">
        <UnauthorizedCard type={type} />
      </section>
    </main>
  );
};

export default page;
