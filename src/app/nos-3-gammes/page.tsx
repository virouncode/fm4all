import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nos 3 gammes",
  description:
    "Découvrez nos 3 gammes de services (essentiel, confort, excellence) pour le Facility Management.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nos 3 gammes</h1>
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
                Vous recherchez des services efficaces et optimisés, qui
                couvrent l’essentiel sans superflu ? Cette gamme est faite pour
                vous. Elle vous garantit le respect des réglementations et vous
                apporte les prestations indispensables pour assurer le bon
                fonctionnement de votre site. Simplicité et efficacité sont au
                rendez-vous.
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allcomfort px-4 text-2xl md:text-3xl text-fm4allcomfort">
                Gamme Confort
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                Pour vous, le bon équilibre entre qualité et prix est essentiel.
                Si le strict minimum ne suffit pas, la Gamme Confort offre une
                solution clé en main, sans contraintes. Vous bénéficiez d’une
                gestion complète des prestations pour un confort optimal, tout
                en restant dans une logique de maîtrise des coûts.
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allexcellence px-4 text-2xl md:text-3xl text-fm4allexcellence">
                Gamme Excellence
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                Vous placez le bien-être de vos collaborateurs au cœur de vos
                priorités. Avec la Gamme Excellence, vous investissez dans des
                services premium qui valorisent votre entreprise et garantissent
                une expérience optimale. L’excellence du service vous offre une
                tranquillité d’esprit totale tout en renforçant votre marque
                employeur.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg mt-10">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Quelle gamme de services choisir ?
          </p>
          <div className="flex flex-col gap-6 justify-between md:w-5/6 mx-auto md:flex-row">
            <div className="h-[180px] w-[300px] relative rounded-xl overflow-hidden hidden lg:block">
              <Image
                src={"/img/baer_otis.webp"}
                alt={"photo d'otis mon scribe"}
                fill={true}
              />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <p>
                Comme dirait Edouard Baer, “Il n’y a pas de bonne ou de mauvaise
                gamme” : chaque solution répond à des besoins et des niveaux
                d’exigences différents.
              </p>
              <p>
                Nous n’offrons pas de services low-cost, mais des options
                adaptées à votre stratégie, à votre image de marque et à vos
                objectifs budgétaires. Vous avez ainsi la liberté de choisir la
                gamme la plus en phase avec vos attentes et vos priorités.
              </p>
            </div>
          </div>
          <p className="md:w-5/6 mx-auto">
            Pour chaque prestation, vous pouvez sélectionner un niveau de gamme
            qui reflète vos ambitions en matière de qualité de service, de
            gestion des ressources et de positionnement stratégique.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Quels prestataires choisir ?
          </p>
          <p className="md:w-5/6 mx-auto">
            La bonne nouvelle, c’est que tous les prestataires référencés sur
            notre plateforme ont été rigoureusement sélectionnés. Nous
            collaborons uniquement avec des entreprises qui partagent nos
            valeurs : sens du service, réactivité, engagement envers la qualité
            et tarifs compétitifs.
          </p>
          <p className="md:w-5/6 mx-auto">
            Tous nos partenaires respectent une charte d’achat exigeante et
            s’engagent à respecter nos Conditions Générales de Vente (CGV). Vous
            avez donc la garantie d’un service aligné sur vos attentes.
          </p>
        </div>
      </article>
    </main>
  );
};

export default page;
