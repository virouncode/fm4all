import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenez Prestataire",
  description:
    "Vous êtes prestataire de service ? fm4all vous propose de devenir partenaire.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Devenir prestataire</h1>
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto hyphens-auto text-wrap">
          <h2 className="text-2xl text-center">
            Vous êtes prestataire de service ? <br />
            Vous cherchez à développer votre activité ?
          </h2>
          <p className="text-center">
            fm4all vous propose de devenir partenaire.
          </p>
          <ul className="ml-10 md:ml-20">
            <li className="list-rocket">Apports d&apos;affaires gratuits</li>
            <li className="list-rocket">
              Paiement garanti : Zéro risque recouvrement
            </li>{" "}
            <li className="list-rocket">
              Gestion administrative déléguée : Zéro devis, zéro paperasse
            </li>
            <li className="list-rocket">
              Obtenez des leads gratuits pour développer votre activité de
              services
            </li>
            <li className="list-rocket">
              Devenez partenaires de la 1ère plateforme d&apos;achat de services
              FM pour les utilisateurs de bureaux, sans limites de taille
            </li>
            <li className="list-rocket">
              100% gratuit, notre plateforme vous apporte des clients qualifiés
              selon les services que vous proposez
            </li>
            <li className="list-rocket">
              C&apos;est vous qui fixez vos règles, vos prix et vos contraintes.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6 text-xl w-full mx-auto hyphens-auto text-wrap max-w-prose md:max-w-none">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Nos engagements
          </h2>
          <ul className="ml-10 md:ml-20">
            <li className="list-thumb">
              Apports d&apos;affaires sans aucun frais
            </li>
            <li className="list-thumb">
              Paiement garanti : Nous garantissons les paiements, pas le client
              final.
            </li>
            <li className="list-thumb">
              Gain de temps : Pas de devis, de contrat ou de CDC à réaliser,
              nous nous chargeons de tout.
            </li>
            <li className="list-thumb">
              Gestion du quotidien : Nous gérons la relation client, les
              réclamations et la facturation.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6 text-xl w-full mx-auto hyphens-auto text-wrap max-w-prose md:max-w-none">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Votre contrepartie
          </h2>
          <ul className="ml-10 md:ml-20">
            <li className="list-handshake">
              Contrat Cadre : vos tarifs sont fixes pendant 12 mois (puis
              révision annuelle)
            </li>
            <li className="list-handshake">
              Vous acceptez des contrats à durée indéterminée
            </li>
            <li className="list-handshake">
              Vous intervenez sur Paris et en IDF (possible d&apos;exclure
              certaines zones)
            </li>
            <li className="list-handshake">
              Vous garantissez la qualité de vos services
            </li>
            <li className="list-handshake">
              Vous êtes réactif, professionnel et proche de vos sites clients.
            </li>
            <li className="list-handshake">
              Vous appliquez des tarifs préférentiels : reflets du gain de temps
              administratif, commercial, recouvrement... Vous garantissez un
              prix au moins 5% inférieur à vos tarifs habituels.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6 text-xl w-full mx-auto hyphens-auto text-wrap max-w-prose md:max-w-none">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Le bénéfice client
          </h2>
          <ul className="ml-10 md:ml-20">
            <li className="list-smile">
              Un grand choix de prestations sur une même plateforme
            </li>
            <li className="list-smile">Des tarifs préférentiels</li>
            <li className="list-smile">
              Un seul point de contact pour gérer tous les services au bureau
            </li>
            <li className="list-smile">
              Un Office Manager présent sur site selon ses besoins
            </li>
            <li className="list-smile">
              Un outil de pilotage en ligne performant
            </li>
          </ul>
        </div>
      </article>
    </main>
  );
};

export default page;
