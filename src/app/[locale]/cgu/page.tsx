import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU)",
  description:
    "Lisez nos conditions générales d'utilisation (CGU) pour en savoir plus sur les règles d'accès et d'utilisation de notre site.",
};

const page = () => {
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">
          Conditions Générales d&apos;Utilisation (CGU) du site fm4all.com
        </h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">1. Objet</h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) ont
              pour objet de définir les conditions d&apos;accès et
              d&apos;utilisation du site internet www.fm4all.com (ci-après « le
              Site »), édité par FM4ALL, société spécialisée dans le facility
              management.
            </p>
            <p className="text-base">
              En accédant au Site, l&apos;utilisateur (ci-après «
              l&apos;Utilisateur ») accepte sans réserve les présentes CGU. En
              cas de désaccord avec ces conditions, l&apos;Utilisateur est
              invité à ne pas utiliser le Site.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            2. Accès au Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Le Site est accessible gratuitement à tout Utilisateur disposant
              d&apos;un accès à Internet. Tous les coûts liés à l&apos;accès au
              Site (matériel informatique, logiciels, connexion Internet, etc.)
              sont à la charge de l&apos;Utilisateur.
            </p>
            <p className="text-base">
              FM4ALL met en œuvre tous les moyens raisonnables pour assurer un
              accès de qualité au Site, mais n&apos;est tenue à aucune
              obligation de résultat. L&apos;accès au Site peut être interrompu
              pour des raisons de maintenance ou pour toute autre raison, sans
              préavis.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            3. Utilisation du Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              L&apos;Utilisateur s&apos;engage à utiliser le Site conformément
              aux présentes CGU et aux lois en vigueur. Il s&apos;interdit
              notamment :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                D&apos;utiliser le Site à des fins illégales ou interdites par
                la loi.
              </li>
              <li className="list-disc">
                D&apos;interférer avec le bon fonctionnement du Site
              </li>
              <li className="list-disc">
                De tenter d&apos;accéder de manière non autorisée aux systèmes
                informatiques de FM4ALL
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            4. Responsabilité
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              FM4ALL s&apos;efforce de fournir des informations précises et à
              jour sur le Site. Toutefois, FM4ALL ne garantit pas
              l&apos;exactitude, l&apos;exhaustivité ou l&apos;actualité des
              informations diffusées sur le Site.
            </p>
            <p className="text-base">
              FM4ALL ne pourra être tenue responsable de tout dommage direct ou
              indirect résultant de l&apos;utilisation du Site ou de
              l&apos;impossibilité d&apos;y accéder.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            5. Propriété Intellectuelle
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Tous les contenus présents sur le Site (textes, images,
              graphismes, logos, icônes, logiciels, etc.) sont la propriété
              exclusive de FM4ALL ou de ses partenaires.
            </p>
            <p className="text-base">
              Toute reproduction, distribution, modification, adaptation,
              retransmission ou publication, même partielle, de ces différents
              éléments est strictement interdite sans l&apos;accord préalable
              écrit de FM4ALL.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            6. Données Personnelles
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              L&apos;Utilisateur est informé que lors de sa navigation sur le
              Site, des données personnelles peuvent être collectées par FM4ALL,
              notamment via les formulaires de contact ou les cookies.
            </p>
            <p className="text-base">
              FM4ALL s&apos;engage à traiter ces données conformément à sa
              Politique de Confidentialité et en respectant la réglementation en
              vigueur sur la protection des données personnelles (RGPD).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            7. Liens Hypertextes
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Le Site peut contenir des liens vers des sites internet tiers.
              FM4ALL n&apos;exerce aucun contrôle sur ces sites et décline toute
              responsabilité quant à leur contenu.
            </p>
            <p className="text-base">
              L&apos;insertion de liens hypertextes vers le Site est autorisée
              sous réserve de ne pas porter atteinte à l&apos;image de FM4ALL et
              de ne pas induire en erreur sur la nature des liens avec FM4ALL.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            8. Modification des CGU
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              FM4ALL se réserve le droit de modifier à tout moment les présentes
              CGU. Les nouvelles conditions seront applicables dès leur mise en
              ligne sur le Site. L&apos;Utilisateur est donc invité à consulter
              régulièrement cette page pour prendre connaissance de toute mise à
              jour.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            9. Droit applicable et juridiction compétente
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Les présentes CGU sont régies par le droit français. En cas de
              litige relatif à l&apos;interprétation ou à l&apos;exécution des
              présentes, les tribunaux compétents de Paris seront seuls
              compétents.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
