import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site fm4all.com",
};

const page = () => {
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Mentions légales</h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            1. Identification de l&apos;Éditeur du Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">Nom de la société : FM4ALL</p>
            <p className="text-base">Forme juridique : SAS</p>
            <p className="text-base">Capital social : 30 000 €</p>
            <p className="text-base">
              Siège social : 3 rue de Nantes, 75019 Paris
            </p>
            <p className="text-base">Numéro SIRET : en cours de création</p>
            <p className="text-base">
              Numéro RCS : RCS Paris en cours de création
            </p>
            <p className="text-base">
              Code APE : 81.10Z Activités combinées de soutien lié aux bâtiments
            </p>
            <p className="text-base">
              Représentant légal : Romuald Buffe, Président de FM4ALL
            </p>
            <p className="text-base">Coordonnées de contact : </p>
            <ul className="ml-10 md:ml-14">
              <li className="list-disc">Tél : +33 6 69 31 10 46</li>
              <li className="list-disc">Email : contact@fm4all.com</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            2. Identification de l&apos;Hébergeur du Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">Nom de l&apos;hébergeur : Vercel Inc.</p>
            <p className="text-base">
              Addresse : 340 S Lemon Ave #4133 Walnut, CA 91789, US
            </p>
            <p className="text-base">Tél : (559) 288-7060</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            3. Propriété Intellectuelle
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap gap-2 mx-auto">
            <p className="text-base">
              Tous les contenus présents sur le site www.fm4all.com, incluant,
              de manière non limitative, les graphismes, images, textes, vidéos,
              animations, sons, logos, gifs et icônes ainsi que leur mise en
              forme sont la propriété exclusive de FM4ALL à l&apos;exception des
              marques, logos ou contenus appartenant à d&apos;autres sociétés
              partenaires ou auteurs.
            </p>
            <p className="text-base">
              Toute reproduction, distribution, modification, adaptation,
              retransmission ou publication, même partielle, de ces différents
              éléments est strictement interdite sans l&apos;accord exprès par
              écrit de FM4ALL. Cette représentation ou reproduction, par quelque
              procédé que ce soit, constitue une contrefaçon sanctionnée par les
              articles L.335-2 et suivants du Code de la propriété
              intellectuelle.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            4. Données personnelles (RGPD)
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap gap-2 mx-auto">
            <p className="text-base">
              FM4ALL s&apos;engage à ce que la collecte et le traitement de vos
              données, effectués à partir du site www.fm4all.com, soient
              conformes au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés.
            </p>
            <p className="text-base">
              Les données personnelles collectées sur le site incluent notamment
              : nom, prénom, adresse email, numéro de téléphone. Ces données
              sont collectées dans le cadre de demandes d&apos;information, de
              devis ou lors de la souscription à nos services.
            </p>
            <p className="text-base">
              Les utilisateurs disposent d&apos;un droit d&apos;accès, de
              rectification, de suppression et d&apos;opposition au traitement
              de leurs données personnelles. Pour exercer ces droits, veuillez
              nous contacter à l&apos;adresse suivante : dpo@fm4all.com.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            5. Limite de responsabilité
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap gap-2 mx-auto">
            <p className="text-base">
              FM4ALL s&apos;efforce de fournir sur le site www.fm4all.com des
              informations aussi précises que possible. Toutefois, la société ne
              pourra être tenue responsable des omissions, des inexactitudes et
              des carences dans la mise à jour, qu&apos;elles soient de son fait
              ou du fait des tiers partenaires qui lui fournissent ces
              informations.
            </p>
            <p className="text-base">
              L&apos;utilisateur du site www.fm4all.com reconnaît disposer de la
              compétence et des moyens nécessaires pour accéder et utiliser ce
              site. L&apos;utilisateur reconnaît également avoir vérifié que la
              configuration informatique utilisée ne contient aucun virus et
              qu&apos;elle est en parfait état de fonctionnement.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            6. Conditions d’Utilisation du Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap gap-2 mx-auto">
            <p className="text-base">
              L&apos;utilisation du site www.fm4all.com implique
              l&apos;acceptation pleine et entière des conditions générales
              d&apos;utilisation ci-après décrites. Ces conditions
              d&apos;utilisation sont susceptibles d&apos;être modifiées ou
              complétées à tout moment, les utilisateurs du site sont donc
              invités à les consulter de manière régulière.
            </p>
            <p className="text-base">
              Le site www.fm4all.com est normalement accessible à tout moment
              aux utilisateurs. Une interruption pour raison de maintenance
              technique peut être toutefois décidée par FM4ALL, qui
              s&apos;efforcera alors de communiquer préalablement aux
              utilisateurs les dates et heures de l&apos;intervention.
            </p>
            <p className="text-base">
              Les utilisateurs disposent d&apos;un droit d&apos;accès, de
              rectification, de suppression et d&apos;opposition au traitement
              de leurs données personnelles. Pour exercer ces droits, veuillez
              nous contacter à l&apos;adresse suivante : dpo@fm4all.com.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            7. Règlement des Litiges
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige relatif à l&apos;utilisation du site
              www.fm4all.com, la compétence exclusive est attribuée aux
              tribunaux compétents de Paris, sous réserve d&apos;une attribution
              de compétence spécifique découlant d&apos;un texte de loi ou
              réglementaire particulier.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            8. Services fournis
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              Le site www.fm4all.com a pour objet de fournir une information
              concernant l’ensemble des activités de la société. FM4ALL
              s’efforce de fournir sur le site des informations aussi précises
              que possible. Toutefois, elle ne pourra être tenue responsable des
              omissions, des inexactitudes et des carences dans la mise à jour,
              qu’elles soient de son fait ou du fait des tiers partenaires qui
              lui fournissent ces informations.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            9. Crédits et Conception du Site
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              Conception du site : Tiao Viroun Kattygnarath
            </p>
            <p className="text-base">
              Crédits photos et ressources : Les crédits des photos, vidéos et
              autres ressources multimédias utilisées sont à Romuald Buffe ou à
              défaut sont indiqués directement sur les éléments concernés ou
              dans une section dédiée.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
