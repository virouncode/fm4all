const TroisGammesPage = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nos 3 gammes</h1>
        <div className="flex flex-col gap-10 text-xl">
          <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
            <p>
              Afin de simplifier vos choix, nous avons décliné l&apos;ensemble
              des services en <strong>3 gammes</strong> :
            </p>
          </div>
          <div className="flex flex-wrap gap-10 justify-center mx-auto text-2xl mb-10">
            <div className="w-44  text-center p-10 bg-teal-500 rounded-lg text-slate-100 font-bold">
              Essentiel
            </div>
            <div className="w-44 text-center p-10 bg-cyan-500 rounded-lg text-slate-100 font-bold">
              Confort
            </div>
            <div className="w-44 text-center p-10 bg-blue-950 rounded-lg text-slate-100 font-bold">
              Excellence
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4 text-xl">
            <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
              <h2 className="border-l-4 border-teal-500 px-4 text-3xl text-teal-500">
                Gamme Essentiel
              </h2>
              <p className="md:ml-10">
                Vous êtes en recherche de{" "}
                <strong>services efficaces et optimisés</strong>. Ce qui est
                important pour vous c&apos;est d&apos;être en règle et
                d&apos;apporter ce qui est essentiel pour votre site.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-xl">
            <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
              <h2 className="border-l-4 border-cyan-400 px-4 text-3xl text-cyan-400">
                Gamme Confort
              </h2>
              <p className="md:ml-10">
                Vous êtes en recherche du{" "}
                <strong>bon rapport qualité prix</strong>. Le strict minimum
                vous semble un peu juste pour cette prestation et vous cherchez
                le bon équilibre. Dans cette formule, tout est géré clé en main,
                sans contraintes.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-xl">
            <div className="flex flex-col gap-4 mx-auto max-w-prose text-justify">
              <h2 className="border-l-2 border-blue-950 px-4 text-3xl text-blue-950">
                Gamme Excellence
              </h2>
              <p className="md:ml-10">
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

export default TroisGammesPage;
