import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Maintenance",
  description: "Maintenance préventive et curative de vos installations.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Maintenance règlementaire</h1>
        <p className="text-xl">
          Veille règlementaire, obligations légales, bien-être au travail,
          déléguez la maintenance et le suivi de vos contrôles.
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-maintenance"
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
