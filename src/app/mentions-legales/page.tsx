import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site fm4all.com",
};

const page = () => {
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      Mentions légales
    </main>
  );
};

export default page;
