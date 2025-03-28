import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description:
    "Lisez notre politique de cookies pour en savoir plus sur l'utilisation des cookies sur notre site.",
};

const page = () => {
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Politique relative aux cookies de fm4all</h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">Dernière mise à jour : 04/03/2025</p>
          <p className="text-base">
            La présente politique relative aux cookies explique comment fm4all
            (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;) utilise des
            cookies et des technologies similaires sur son site web
            https://www.fm4all.com (le &quot;Site&quot;).
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            1. Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              Les cookies sont de petits fichiers texte qui sont placés sur
              votre ordinateur ou votre appareil mobile lorsque vous visitez un
              site web. Ils sont largement utilisés pour permettre aux sites web
              de fonctionner plus efficacement, ainsi que pour fournir des
              informations aux propriétaires du site.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            2. Types de cookies que nous utilisons
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous utilisons les types de cookies suivants :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Cookies strictement nécessaires</strong> : Ces cookies
                sont essentiels au fonctionnement du Site et vous permettent
                d&apos;utiliser ses fonctionnalités de base, telles que la
                navigation sur les pages et l&apos;accès aux zones sécurisées.
                Ces cookies ne collectent aucune information vous concernant qui
                pourrait être utilisée à des fins de marketing ou pour mémoriser
                les sites que vous avez visités sur Internet. Base légale :
                Intérêt légitime
              </li>
              <li className="list-disc">
                <strong>Cookies de performance/analyse</strong> : Ces cookies
                nous permettent de compter les visites et les sources de trafic
                afin de mesurer et d&apos;améliorer les performances de notre
                Site. Ils nous aident à savoir quelles pages sont les plus et
                les moins populaires et à voir comment les visiteurs se
                déplacent sur le Site. Toutes les informations collectées par
                ces cookies sont agrégées et donc anonymes. Nous utilisons
                Google Analytics pour cette finalité. Base légale : Consentement
              </li>
              <li className="list-disc">
                <strong>Cookies de fonctionnalité</strong> : Ces cookies
                permettent au Site de se souvenir des choix que vous avez faits
                (tels que votre langue ou votre région) et de fournir des
                fonctionnalités améliorées et plus personnelles. Ils peuvent
                également être utilisés pour fournir des services que vous avez
                demandés, tels que regarder une vidéo ou commenter un blog. Les
                informations collectées par ces cookies peuvent être anonymisées
                et ils ne peuvent pas suivre votre activité de navigation sur
                d&apos;autres sites web. Base légale : Consentement
              </li>
              <li className="list-disc">
                <strong>Cookies de ciblage/publicité</strong> : Ces cookies sont
                utilisés pour diffuser des publicités plus pertinentes pour vous
                et vos intérêts. Ils sont également utilisés pour limiter le
                nombre de fois que vous voyez une publicité, ainsi que pour
                aider à mesurer l&apos;efficacité des campagnes publicitaires.
                Ils sont généralement placés par des réseaux publicitaires avec
                la permission de l&apos;opérateur du site web. Base légale :
                Consentement
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            3. Liste des cookies utilisés
          </h2>
          <div className="flex flex-col w-full md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2 overflow-x-auto">
            <Table>
              <TableCaption>List des cookies utilisés</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du cookie</TableHead>
                  <TableHead>Nom du fournisseur</TableHead>
                  <TableHead>Finalité</TableHead>
                  <TableHead>Durée de conservation</TableHead>
                  <TableHead>Type de cookie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>_ga</TableCell>
                  <TableCell>Google Analytics</TableCell>
                  <TableCell>
                    Utilisé pour distinguer les utilisateurs
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Suivi Analytique</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>_ga_GPWGXZXVW0</TableCell>
                  <TableCell>Google Analytics</TableCell>
                  <TableCell>
                    Identifie de manière unique un visiteur sur plusieurs
                    sessions
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Suivi Analytique</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ADS_VISITOR_ID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Identifie un utilisateur unique pour le suivi des publicités
                    et du remarketing
                  </TableCell>
                  <TableCell>13 mois</TableCell>
                  <TableCell>Suivi publicitaire et analytique</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AEC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assure que les requêtes des utilisateurs ne sont pas
                    falsifiées
                  </TableCell>
                  <TableCell>6 mois</TableCell>
                  <TableCell>Sécurité</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>APISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Stockage des préférences et informations de session de
                    l&apos;utilisateur
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Suivi et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Stockage des informations de session, liées à
                    l&apos;authentification et la sécurisation des comptes
                    Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et authentification</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Personnaliser les annonces qui sont affichées sur Google et
                    ses partenaires
                  </TableCell>
                  <TableCell>6 mois</TableCell>
                  <TableCell>Suivi publicitaire et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>OTZ</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>Optimiser la diffusion des publicités</TableCell>
                  <TableCell>28 jours</TableCell>
                  <TableCell>Suivi publicitaire et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Authentifier un utilisateur lorsque ce dernier est connecté
                    à son compte Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et authentification</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SEARCH_SAMESITE</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Protéger les utilisateurs contre certains types
                    d&apos;attaques, en particulier les attaques de
                    falsification de requêtes inter-sites
                  </TableCell>
                  <TableCell>Quelques h</TableCell>
                  <TableCell>Sécurité et gestion de session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Maintenir l&apos;authentification active lorsque
                    l&apos;utilisateur navigue sur des services comme Gmail,
                    Google Drive, YouTube
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et gestion de session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Renforcer la sécurité de la session de l&apos;utilisateur
                    connecté à son compte Google
                  </TableCell>
                  <TableCell>3 mois</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Maintenir la session d&apos;un utilisateur qui est connecté
                    à son compte Google, en garantissant qu&apos;il ne soit pas
                    obligé de se reconnecter à chaque page
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et gestion de session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement dans le cadre des services de publicité
                    Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Maintenir et sécuriser la session des utilisateurs
                    lorsqu&apos;ils sont connectés à leurs comptes Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Empêcher les utilisateurs d&apos;être déconnectés
                    lorsqu&apos;ils naviguent entre les pages des services
                    Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDTS</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Empêcher les utilisateurs d&apos;être déconnectés
                    lorsqu&apos;ils naviguent entre les pages des services
                    Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement lorsqu&apos;ils interagissent avec les
                    services Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement lorsqu&apos;ils interagissent avec les
                    services Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement lorsqu&apos;ils interagissent avec les
                    services Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDTS</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement lorsqu&apos;ils interagissent avec les
                    services Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-ENID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    Assurer la sécurité des sessions utilisateurs,
                    particulièrement lorsqu&apos;ils interagissent avec les
                    services Google
                  </TableCell>
                  <TableCell>2 ans</TableCell>
                  <TableCell>Sécurité et personnalisation</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            4. Comment gérer les cookies ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Vous pouvez gérer vos préférences en matière de cookies à tout
              moment :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Bannière cookies</strong> : Lors de chaque session vous
                verrez apparaître une banière de consentement aux cookies. Vous
                pouvez accepter ou refuser les cookies non essentiels.
              </li>
              <li className="list-disc">
                <strong>Paramètres du navigateur</strong> : La plupart des
                navigateurs web vous permettent de contrôler les cookies via
                leurs paramètres. Vous pouvez généralement configurer votre
                navigateur pour qu&apos;il refuse tous les cookies ou pour
                qu&apos;il vous avertisse lorsqu&apos;un cookie est envoyé.
                Cependant, si vous désactivez les cookies, certaines parties de
                notre Site peuvent ne pas fonctionner correctement. Pour plus
                d&apos;informations sur la façon de gérer les cookies dans votre
                navigateur, veuillez consulter la documentation de votre
                navigateur
              </li>
              {/* <li className="list-disc">
                <strong>Outil de gestion des cookies</strong> :  [Si vous utilisez un outil tiers de gestion des cookies (Cookiebot, Tarteaucitron, etc.), mentionnez-le ici et fournissez un lien vers cet outil.]
              </li> */}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            5. Consentement aux cookies
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Lors de votre première visite sur notre Site, une bannière de
              consentement aux cookies s&apos;affiche. Cette bannière vous
              permet d&apos;accepter ou de refuser les cookies non essentiels.
              Votre consentement est enregistré pour une durée de 6 mois.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            6. Modifications de cette politique
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous pouvons mettre à jour cette politique relative aux cookies de
              temps à autre. Toute modification sera publiée sur cette page avec
              une date de mise à jour révisée.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            7. Nous contacter
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Si vous avez des questions concernant cette politique relative aux
              cookies, veuillez nous contacter à :
            </p>
            <p className="text-base">fm4all</p>
            <p className="text-base">3 rue de Nantes, 75019 PARIS</p>
            <p className="text-base">admin@fm4all.com</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
