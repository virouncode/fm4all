import { Metadata } from "next";
import ArticleCards from "./ArticleCards";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles intéressants autour du facility management, de l'hospitality managment et de l'office management",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Articles</h1>
        <ArticleCards />
      </section>
    </main>
  );
};

export default page;
