import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Contactez-nous pour des questions sur nos services de facility managment",
};

const page = () => {
  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nous contacter</h1>
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto hyphens-auto text-wrap items-center">
          <p>Des questions sur nos services ou nos offres en général ?</p>
          <p>Nous sommes là.</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Button variant="destructive" size="lg" className="text-base">
            <Link
              href="https://calendly.com/romuald-fm4all/rdv-fm4all"
              target="_blank"
            >
              Je prends un rendez-vous en visio
            </Link>
          </Button>
          <Button variant="destructive" size="lg" className="text-base">
            <Link href="tel:+33669311046">Je contacte par téléphone</Link>
          </Button>
          <Button variant="destructive" size="lg" className="text-base">
            <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center w-full">
          <div>
            {/* <p>
              Par téléphone :{" "}
              <a
                className="font-bold underline"
                href="tel:+33(0)669311046"
                rel="noopener noreferrer"
                target="_blank"
              >
                +33(0)669311046
              </a>
            </p>
            <p>
              Par email :{" "}
              <a
                className="font-bold underline"
                href="mailto:contact@fm4all.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                contact@fm4all.com
              </a>
            </p> */}
            <p className="text-base text-center mt-4">Romuald Buffe</p>
            <p className="text-base text-center">Dirigeant fm4all</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
