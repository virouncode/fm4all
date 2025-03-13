import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV)",
  description:
    "Lisez nos conditions générales de vente (CGV) pour en savoir plus sur les règles d'achat et de paiement",
};

const page = () => {
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Conditions Générales de Vente (CGV)</h1>
        <div className="flex flex-col gap-4 w-full mx-auto max-w-prose items-center">
          <p>
            Si le document ne s&apos;affiche pas correctement :{" "}
            <Link
              href="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250303-Tmu6Vmvpwg7boAzkM9dFt3Vyc4Rw3n.pdf"
              target="_blank"
              className="underline"
            >
              Cliquez ici
            </Link>
          </p>
        </div>
        <div className="w-full mt-6 mb-6">
          <iframe
            src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250303-Tmu6Vmvpwg7boAzkM9dFt3Vyc4Rw3n.pdf"
            className="w-full h-screen"
          />
        </div>
      </section>
    </main>
  );
};

export default page;
