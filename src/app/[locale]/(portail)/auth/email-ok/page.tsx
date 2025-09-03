import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import EmailOkCard from "./EmailOkCard";

const page = () => {
  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundServer />
        <EmailOkCard />
      </section>
    </main>
  );
};

export default page;
