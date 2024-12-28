import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Snacks & fruits",
  description: "Selection de snacks et fruits pour vos collaborateurs",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Snacks & fruits</h1>
        <p className="text-xl">
          Donner, c&apos;est recevoir ! Fruité ou gourmand, offrez du bien-être
          à vos collaborateurs !
        </p>
        <div className="w-full h-[500px] rounded-lg relative overflow-hidden">
          <Image
            src={"https://picsum.photos/1200/500"}
            alt="illustration-snacks-et-fruits"
            quality={100}
            className="w-full h-full object-cover"
            fill={true}
          />
        </div>
        <p className="text-xl">
          Il n&apos;y a pas que les GAFAM qui prennent soin de leurs
          collaborateurs. Fruité ou gourmand, offrez du bien-être !
          <br />
          Parce que lorsqu&apos;on en prend soin, ils nous le rendent bien,
          fruité ou gourmand, offrez du bien-être à vos collaborateurs !
        </p>
      </section>
    </main>
  );
};

export default page;
