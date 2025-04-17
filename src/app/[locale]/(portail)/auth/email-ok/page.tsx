import BackgroundServer from "@/components/BackgroundServer";
import EmailOkCard from "./EmailOkCard";

const page = () => {
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto py-4 px-6 md:px-20">
      <section className="flex items-center justify-center h-full">
        <BackgroundServer />
        <EmailOkCard />
      </section>
    </main>
  );
};

export default page;
