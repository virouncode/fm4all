import BackgroundServer from "@/components/BackgroundServer";

const page = () => {
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20">
      <section className="flex items-center justify-center h-full">
        <BackgroundServer />
      </section>
    </main>
  );
};

export default page;
