import { Metadata } from "next";

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
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto text-justify items-center">
          <p>Des questions sur nos services ou nos offres en général ?</p>
          <p>Nous sommes là.</p>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="text-xl">
            <p>
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
            </p>
            <p className="text-base text-center mt-4">Romuald Buffe</p>
            <p className="text-base text-center">Dirigeant fm4all</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
