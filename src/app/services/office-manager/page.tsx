import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Office Manager",
  description:
    "Hospitality, Office ou Facility Manager, une personne dédiée chez vous dès ½ journée par semaine.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Office Manager</h1>
        <p className="text-xl">
          Hospitality, Office ou Facility Manager, une personne dédiée chez vous
          dès ½ journée par semaine.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-office-manager"
            quality={100}
            className="w-full h-full object-cover"
            fill={true}
          />
        </div>
      </section>
    </main>
  );
};

export default page;
