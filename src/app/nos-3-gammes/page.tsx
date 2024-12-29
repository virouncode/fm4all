import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos 3 gammes",
  description:
    "Découvrez nos 3 gammes de services pour le Facility Management.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl">Nos 3 gammes</h1>
        <div className="flex flex-col gap-10 w-full mx-auto hyphens-auto text-wrap">
          <div className="flex flex-col gap-10 text-lg">
            <p className="text-center max-w-prose mx-auto text-pretty">
              Afin de simplifier vos choix, nous avons décliné l&apos;ensemble
              des services en <strong>3 gammes</strong> :
            </p>
            <div className="flex flex-wrap gap-10 justify-center text-2xl mb-10">
              <div className="w-48 text-center px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold">
                Essentiel
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200  font-bold">
                Confort
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold">
                Excellence
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allessential px-4 text-2xl md:text-3xl text-fm4allessential">
                Gamme Essentiel
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                Vous êtes en recherche de{" "}
                <strong>services efficaces et optimisés</strong>. Ce qui est
                important pour vous c&apos;est d&apos;être en règle et
                d&apos;apporter ce qui est essentiel pour votre site.
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allcomfort px-4 text-2xl md:text-3xl text-fm4allcomfort">
                Gamme Confort
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                Vous êtes en recherche du{" "}
                <strong>bon rapport qualité prix</strong>. Le strict minimum
                vous semble un peu juste pour cette prestation et vous cherchez
                le bon équilibre. Dans cette formule, tout est géré clé en main,
                sans contraintes.
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allexcellence px-4 text-2xl md:text-3xl text-fm4allexcellence">
                Gamme Excellence
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                <strong>Le bien être au travail</strong>, c&apos;est important.
                Vous investissez sur les services envers vos collaborateurs, car
                ils vous le rendent bien. L&apos;excellence de service vous
                donne tranquillité d&apos;esprit.
              </p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
