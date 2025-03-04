import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Lisez notre politique de confidentialité pour en savoir plus sur la collecte et le traitement de vos données personnelles.",
};

const page = () => {
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Politique de confidentialité</h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">
            Chez fm4all, Société par actions simplifiée (en cours
            d&apos;immatriculation, numéro SIRET communiqué dès obtention),
            domiciliée au 3 rue de Nantes, 75019 Paris, nous accordons une
            grande importance à la protection de vos données personnelles.
          </p>
          <p className="text-base">
            La présente politique de confidentialité explique comment nous
            collectons, utilisons, partageons et protégeons vos données
            conformément au Règlement Général sur la Protection des Données
            (RGPD) et à la loi Informatique et Libertés.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            1. Qui sommes-nous ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              Le responsable du traitement des données est la société fm4all,
              Société par actions simplifiée (en cours d&apos;immatriculation,
              numéro SIRET communiqué dès obtention), domiciliée au 3 rue de
              Nantes, 75019 Paris. Vous pouvez nous contacter pour toute
              question relative à la protection des données à l&apos;adresse
              suivante : admin@fm4all.com
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            2. Quelles données personnelles collectons-nous ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous collectons les catégories de données personnelles suivantes :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Données d&apos;identification</strong> : Nom, prénom,
                adresse e-mail, numéro de téléphone, adresse postale, nom de
                l&apos;entreprise.{" "}
                <em>Base légale : Exécution du contrat (mise en relation).</em>
              </li>
              <li className="list-disc">
                <strong>
                  Données relatives à l&apos;activité professionnelle
                </strong>{" "}
                : Fonction, secteur d&apos;activité, taille de
                l&apos;entreprise.{" "}
                <em>
                  Base légale : Intérêt légitime (profilage pour proposer des
                  services pertinents).
                </em>
              </li>
              <li className="list-disc">
                <strong>Données de connexion</strong> : Adresse IP, données de
                navigation sur notre site web (cookies de session pour le
                fonctionnement du site, cookies d&apos;analyse d&apos;audience
                Google Analytics (avec IP anonymisée) pour améliorer nos
                services).{" "}
                <em>
                  Base légale : Consentement pour les cookies non essentiels,
                  intérêt légitime pour les cookies strictement nécessaires au
                  fonctionnement du site.
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  Données relatives aux demandes de devis et aux prestations
                </strong>{" "}
                : Type de service demandé, date de la demande, budget estimé,
                description des besoins, informations sur les prestataires
                contactés, les contrats conclus, les évaluations des
                prestations.{" "}
                <em>
                  Base légale : Exécution du contrat (mise en relation, suivi
                  des prestations).
                </em>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            3. Pourquoi collectons-nous vos données personnelles ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous collectons vos données personnelles pour les finalités
              suivantes :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Données d&apos;identification</strong> : Nom, prénom,
                adresse e-mail, numéro de téléphone, adresse postale, nom de
                l&apos;entreprise.{" "}
                <em>Base légale : Exécution du contrat (mise en relation).</em>
              </li>
              <li className="list-disc">
                <strong>Fourniture de nos services</strong> : Mise en relation
                avec des prestataires de services généraux, gestion des demandes
                de devis, suivi des prestations, facturation.{" "}
                <em>Base légale : Exécution du contrat.</em>
              </li>
              <li className="list-disc">
                <strong>Gestion de la relation client</strong> : Communication
                avec les utilisateurs, support client, traitement des
                réclamations.{" "}
                <em>
                  Base légale : Exécution du contrat, intérêt légitime
                  (amélioration de la relation client).
                </em>
              </li>
              <li className="list-disc">
                <strong>Amélioration de nos services</strong> : Analyse des
                données d&apos;utilisation de notre plateforme (avec données
                anonymisées lorsque cela est possible), développement de
                nouvelles fonctionnalités.{" "}
                <em>
                  Base légale : Intérêt légitime (amélioration continue de nos
                  services).
                </em>
              </li>
              <li className="list-disc">
                <strong>Marketing et communication</strong> : Sous réserve de
                votre consentement explicite (case à cocher dédiée), nous
                pouvons utiliser vos données pour vous envoyer des informations
                sur nos services et offres promotionnelles. Vous pouvez retirer
                votre consentement à tout moment en cliquant sur le lien de
                désabonnement présent dans chaque email ou en nous contactant à
                l&apos;adresse mentionnée au point 1.{" "}
                <em>Base légale : Consentement.</em>
              </li>
              <li className="list-disc">
                <strong>Respect des obligations légales</strong> : Gestion des
                obligations comptables et fiscales, réponse aux demandes des
                autorités compétentes. <em>Base légale : Obligation légale.</em>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            4. Qui sont les destinataires de vos données ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Vos données personnelles peuvent être communiquées aux
              destinataires suivants :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  Les prestataires de services référencés sur notre plateforme
                </strong>{" "}
                : Uniquement les informations nécessaires à la mise en relation
                et à l&apos;exécution de la prestation (par exemple, le nom et
                les coordonnées de l&apos;entreprise cliente, le type de service
                demandé).
              </li>
              <li className="list-disc">
                <strong>Nos prestataires techniques :</strong> [a remplir]
              </li>
              <li className="list-disc">
                <strong>Les autorités compétentes</strong> : En cas
                d&apos;obligation légale ou de demande judiciaire.
              </li>
            </ul>
            <p className="text-base">
              Nous nous assurons que nos partenaires et prestataires respectent
              les mêmes exigences en matière de protection des données que les
              nôtres, notamment par le biais de contrats incluant les clauses
              contractuelles types de la Commission Européenne si des transferts
              hors UE ont lieu.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            5. Combien de temps conservons-nous vos données ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous conservons vos données personnelles pendant les durées
              suivantes :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Données relatives à la gestion de compte</strong> : Tant
                que le compte est actif et pendant 3 ans après la suppression du
                compte pour gérer les éventuelles réclamations.
              </li>
              <li className="list-disc">
                <strong>
                  Données relatives aux demandes de devis et aux prestations :
                </strong>{" "}
                3 ans après la fin de la prestation ou le dernier contact actif,
                sauf obligation légale de conservation plus longue (par exemple,
                10 ans pour les factures).
              </li>
              <li className="list-disc">
                <strong>Données de prospection commerciale</strong> : 3 ans
                après le dernier contact actif.
              </li>
              <li className="list-disc">
                <strong>Données de facturation</strong> : 10 ans conformément
                aux obligations légales.
              </li>
              <li className="list-disc">
                <strong>Cookies : </strong> : Voir notre politique de cookies
                pour la durée de conservation spécifique à chaque cookie.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            6. Quels sont vos droits ?
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Conformément à la réglementation applicable, vous disposez des
              droits suivants :
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>Droit d&apos;accès</strong> : Vous pouvez obtenir la
                confirmation que vos données sont traitées et demander à y
                accéder.
              </li>
              <li className="list-disc">
                <strong>Droit de rectification</strong> : Vous pouvez demander
                la correction de données inexactes ou incomplètes.
              </li>
              <li className="list-disc">
                <strong>Droit à l&apos;effacement</strong> : Vous pouvez
                demander la suppression de vos données dans certains cas (par
                exemple, si les données ne sont plus nécessaires aux finalités
                pour lesquelles elles ont été collectées).
              </li>
              <li className="list-disc">
                <strong>Droit à la limitation du traitement</strong> : Vous
                pouvez demander la suspension temporaire du traitement de vos
                données dans certains cas.
              </li>
              <li className="list-disc">
                <strong>Droit d&apos;opposition</strong> : Vous pouvez vous
                opposer au traitement de vos données pour des motifs légitimes,
                notamment au traitement à des fins de prospection commerciale.
              </li>
              <li className="list-disc">
                <strong>Droit à la portabilité</strong> : Vous pouvez récupérer
                vos données dans un format structuré et lisible par machine.
              </li>
              <li className="list-disc">
                <strong>
                  Droit d&apos;introduire une réclamation auprès de la CNIL
                </strong>{" "}
                : Si vous estimez que vos droits ne sont pas respectés, vous
                pouvez saisir la CNIL (Commission Nationale de
                l&apos;Informatique et des Libertés).
              </li>
            </ul>
            <p className="text-base">
              Pour exercer vos droits, vous pouvez nous contacter par email à
              admin@fm4all.com ou par courrier à l&apos;adresse mentionnée au
              point 1. Veuillez joindre une copie de votre pièce d&apos;identité
              à votre demande.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            7. Utilisation des cookies
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Notre site web utilise des cookies. Pour en savoir plus sur les
              types de cookies que nous utilisons, leur finalité et comment les
              gérer, veuillez consulter notre{" "}
              <Link
                href="/politique-de-cookies"
                className="underline text-blue-500"
              >
                politique de cookies
              </Link>
              . Une bannière de consentement aux cookies s&apos;affiche lors de
              votre première visite sur notre site.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            8. Sécurité des données
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous mettons en œuvre des mesures de sécurité techniques et
              organisationnelles appropriées pour protéger vos données
              personnelles contre tout accès non autorisé, toute divulgation,
              toute altération ou toute destruction, notamment le chiffrement
              des données en transit (HTTPS), le contrôle d&apos;accès aux
              données et des mesures de protection contre les intrusions.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            9. Modifications de la politique de confidentialité
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              Nous nous réservons le droit de modifier la présente politique de
              confidentialité à tout moment. Les modifications seront publiées
              sur notre site web et nous vous informerons des changements
              importants par un message sur la plateforme ou par email.
            </p>
            <p>Date de dernière mise à jour : 01/02/2025</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
