import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services: Maintenance",
  description: "Maintenance préventive et curative de vos installations.",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Maintenance</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold text-center">
            Maintenance Multitechnique & Contrôles Réglementaires : Protégez vos
            locaux et assurez votre tranquillité d&apos;esprit
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/maintenance.webp"}
              alt="illustration-maintenance"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Gérer un espace de travail fonctionnel et conforme aux
            réglementations en vigueur peut être complexe et chronophage. Chez
            fm4all, nous simplifions votre quotidien en prenant en charge la
            maintenance multitechnique et les contrôles réglementaires, pour que
            vous puissiez vous concentrer sur votre cœur de métier.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Votre espace de travail, toujours opérationnel
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Nos équipes expertes et nos partenaires qualifiés interviennent pour
            garantir le bon fonctionnement de vos installations techniques.
            Qu’il s’agisse de vos systèmes électriques, de climatisation, de
            chauffage ou de plomberie, nous assurons une gestion proactive et
            réactive pour éviter tout dysfonctionnement.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Offrez à vos bureaux un entretien fonctionnel et optimisé.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Vous êtes locataire ?
          </p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Nos services incluent le réglementaire :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">Contrôle des installations</li>
            <li className="list-disc">
              Vérification des équipements privatifs
            </li>
            <li className="list-disc">Analyse légionellose</li>
            <li className="list-disc">
              Contrôle des installations électriques pour votre assurance (Q18)
            </li>
            <li className="list-disc">Tenue du registre de sécurité</li>
          </ul>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Mais aussi la maintenance du quotidien :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Petite maintenance et travaux de second œuvre (peinture,
              menuiserie…)
            </li>
            <li className="list-disc">Plomberie</li>
            <li className="list-disc">
              Relamping / remplacement des luminaires
            </li>
            <li className="list-disc">Factotum</li>
            <li className="list-disc">
              Contrôle des installations de sécurité
            </li>
          </ul>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Et enfin, le lien avec le propriétaire, le gestionnaire de
            l’immeuble et ses équipes techniques :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Passage hiver / été : Réglage ventilation, chauffage,
              climatisation…
            </li>
            <li className="list-disc">Gestion des incidents (fuites, etc.)</li>
            <li className="list-disc">Coordination travaux</li>
          </ul>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Ce qui est inclus en fonction des gammes :
          </p>
        </div>
        <div className="w-full md:w-3/4 h-[200px] rounded-lg relative overflow-hidden mx-auto">
          <Image
            src={"/img/services/maintenance_cdc.webp"}
            alt="maintenance-cdc"
            quality={100}
            className="object-contain"
            fill={true}
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Au total, deux passages par an pour valider tout l’aspect technique
            et réglementaire de vos locaux :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Contrôle des Extincteurs et BAES : Contrôle de tous les organes,
              test d’autonomie, maintenance et nettoyage
            </li>
            <li className="list-disc">
              Vérification des équipements, des installations et des systèmes de
              sécurité de l’établissement
            </li>
            <li className="list-disc">
              Vérification des équipements privatifs (chauffage, climatisation,
              ventilation, etc.)
            </li>
            <li className="list-disc">
              Maintenance Salle Serveur (sur devis complémentaire)
            </li>
            <li className="list-disc">
              Vérification Périodique et Certificat Q18 des installations :
              obligation article R.4226-16 du Code du travail
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Un passage tous les 2 mois
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Toute la gamme Essentiel, avec en plus selon recommandation de
            l’Agence Régionale de Santé :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Analyse laboratoire prévention légionellose des installations
            </li>
            <li className="list-disc">
              Production eau chaude individuelle (NF EN 806-5 et recommandations
              ARS)
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ainsi que 4 passages supplémentaires pour :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Factotum : Petits Travaux: Selon carnet de suivi
            </li>
            <li className="list-disc">
              Relamping (hors fourniture) : Changement luminaire défectueux
            </li>
            <li className="list-disc">
              Petit déménagement : Déplacement réalisable à une personne
            </li>
            <li className="list-disc">
              Second œuvre : Petites réparations, peinture et menuiserie
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Passage tous les mois
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Toute la gamme Essentiel et Confort avec en plus :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Analyse et surveillance qualité de l’air (analyse laboratoire)
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ainsi que 6 passages supplémentaires pour :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Factotum : Petits Travaux: Selon carnet de suivi
            </li>
            <li className="list-disc">
              Relamping (hors fourniture) : Changement luminaire défectueux
            </li>
            <li className="list-disc">
              Petit déménagement : Déplacement réalisable à une personne
            </li>
            <li className="list-disc">
              Second œuvre : Petites réparations, peinture et menuiserie
            </li>
            <li className="list-disc">
              Contrôle des Extincteurs et BAES mensuel
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-lg max-w-prose hyphens-auto text-wrap font-bold">
            Vous êtes propriétaire de votre bâtiment ou mono locataire ?{" "}
          </p>
          <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
            Pour les mono locataires utilisant un bâtiment complet, la
            maintenance prend une autre dimension. Vous êtes responsable de la
            production de chaud, froid, etc.
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Interventions préventives : Inspection régulière des équipements
              pour prévenir les pannes et prolonger leur durée de vie
            </li>
            <li className="list-disc">
              Interventions curatives : Réparations rapides en cas de problème
              pour limiter les interruptions d’activité
            </li>
            <li className="list-disc">
              Suivi des installations : Historique détaillé des interventions
              pour une gestion optimisée et transparente
            </li>
            <li className="list-disc">
              Coordination des prestataires : Nous centralisons les échanges
              avec les techniciens et garantissons le suivi des opérations
            </li>
          </ul>
          <p className="text-lg mx-auto max-w-prose hyphens-auto text-wrap">
            Avec fm4all, vous avez l’assurance d’une maintenance technique
            optimisée, pensée pour maximiser la performance de vos locaux.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Contrôles Réglementaires : Conformité et sécurité garanties
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            En France, les entreprises sont soumises à des obligations strictes
            en matière de sécurité des locaux et des équipements. Le non-respect
            de ces obligations peut entraîner des sanctions juridiques, des
            arrêts d’activité ou des risques pour vos collaborateurs.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            fm4all prend en charge :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              La planification et la réalisation des contrôles réglementaires
              obligatoires (ascenseurs, extincteurs, installations électriques,
              etc.)
            </li>
            <li className="list-disc">
              La mise en conformité des équipements selon les normes en vigueur
            </li>
            <li className="list-disc">
              Le suivi des échéances et la gestion des rapports d’audit
            </li>
            <li className="list-disc">
              La liaison avec les organismes agréés pour simplifier vos
              démarches administratives
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Exemples de contrôles obligatoires pris en charge :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Contrôle des installations électriques : Sécurité et conformité
              des réseaux électriques
            </li>
            <li className="list-disc">
              Contrôle des ascenseurs : Vérification périodique pour garantir la
              sécurité des utilisateurs
            </li>
            <li className="list-disc">
              Inspection des équipements incendie : Vérification des
              extincteurs, alarmes et issues de secours
            </li>
            <li className="list-disc">
              Contrôle des appareils de levage : Sécurité des engins tels que
              monte-charges ou élévateurs
            </li>
            <li className="list-disc">
              Conformité des installations de chauffage et de climatisation :
              Garantir leur bon fonctionnement tout en respectant les normes
              environnementales
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pourquoi choisir fm4all pour votre maintenance et vos contrôles ?
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Expertise reconnue : Nos partenaires techniques sont sélectionnés
              pour leur savoir-faire et leur sérieux
            </li>
            <li className="list-disc">
              Simplicité de gestion : Nous prenons en charge toute la logistique
              et la coordination des interventions
            </li>
            <li className="list-disc">
              Conformité garantie : Vous êtes assuré de respecter toutes les
              obligations légales en vigueur
            </li>
            <li className="list-disc">
              Gain de temps : Fini les calendriers complexes et les démarches
              administratives, nous gérons tout pour vous
            </li>
            <li className="list-disc">
              Traçabilité : Un suivi clair et transparent des interventions et
              des contrôles pour une tranquillité d’esprit totale
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Un accompagnement sur-mesure
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Avec fm4all, vous bénéficiez d’un accompagnement personnalisé. Que
            vous soyez une TPE, une PME ou une grande entreprise, nous adaptons
            nos prestations à vos besoins spécifiques et à la taille de vos
            locaux.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            <strong>Contactez-nous dès maintenant</strong> pour discuter de vos
            besoins en maintenance multitechnique et en contrôles
            réglementaires. Nous sommes là pour vous accompagner à chaque étape
            et garantir un environnement de travail performant, sécurisé et
            conforme.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous en visio
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Pour aller plus loin dans le détail de nos prestations
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Sécurisez vos installations électriques avec fm4all : Vérification
            Périodique et Certificat Q18
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Chez fm4all, nous comprenons l&apos;importance cruciale de la
            sécurité électrique pour la pérennité de votre activité. Une
            installation électrique défaillante représente un risque majeur
            d&apos;incendie, d&apos;explosion, d&apos;électrisation et
            d&apos;électrocution, mettant en danger vos employés, vos locaux et
            la continuité de vos opérations. C&apos;est pourquoi nous proposons
            un service de vérification périodique des installations électriques,
            aboutissant à l&apos;obtention du certificat APSAD Q18, reconnu par
            les assureurs.
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Pourquoi choisir la vérification Q18 avec fm4all ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notre prestation vous permet de :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Répondre aux exigences de votre assureur : Obtenez un compte rendu
              de vérifications Q18, document essentiel pour votre couverture
              d&apos;assurance
            </li>
            <li className="list-disc">
              Respecter vos obligations réglementaires : Assurez le maintien en
              état de conformité de vos installations électriques, conformément
              aux normes en vigueur
            </li>
            <li className="list-disc">
              Protéger vos équipes et le public : Prévenez les accidents liés
              aux dangers de l&apos;électricité et garantissez la sécurité de
              tous
            </li>
            <li className="list-disc">
              Minimiser les risques pour vos biens : Évaluez la sécurité de vos
              locaux face aux risques électriques (incendie, explosion, etc.) et
              mettez en place des mesures préventives
            </li>
            <li className="list-disc">
              Garantir la continuité de votre activité : Anticipez les pannes et
              les incidents électriques pour éviter les interruptions
              d&apos;exploitation coûteuses
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Notre approche : un accompagnement complet pour votre sécurité
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notre service de vérification Q18 est conçu pour être simple et
            efficace. Il est important de noter que cette vérification suppose
            la possession du rapport de vérification initiale et des rapports
            des vérifications périodiques antérieures. Si ce n&apos;est pas le
            cas, nous vous proposerons une vérification initiale afin
            d&apos;établir une base solide pour le suivi de vos installations.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Ce que comprend cette mission :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Vérification périodique réglementaire et Q18 : Une inspection
              complète de vos installations, combinant les exigences
              réglementaires et les critères du référentiel APSAD Q18
            </li>
            <li className="list-disc">
              Rapport de vérification détaillé : Un compte rendu clair et
              précis, documentant les constats de la vérification et les
              éventuelles non-conformités
            </li>
            <li className="list-disc">
              Mise à jour du registre de sécurité : L&apos;actualisation de
              votre registre réglementaire de vérification des installations
              électriques
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Spécificités pour les ERP et les IGH :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Établissements Recevant du Public (ERP) : En plus des prestations
              mentionnées, nous respectons les exigences spécifiques du
              règlement de sécurité applicable aux ERP
            </li>
            <li className="list-disc">
              Immeubles de Grande Hauteur (IGH) : Nous prenons également en
              compte les dispositions de l&apos;arrêté du 30/12/11 relatif à la
              sécurité incendie et panique dans les IGH
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Préparer la vérification : les informations nécessaires
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Pour optimiser l&apos;intervention de nos experts, nous vous
            demandons de mettre à disposition :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Un interlocuteur qualifié : Un représentant de l&apos;entreprise
              chargée de la maintenance des installations ou, à défaut, une
              personne désignée de votre établissement, capable d&apos;effectuer
              les manœuvres de coupure, de sectionnement et de remise en service
            </li>
            <li className="list-disc">
              La documentation technique :
              <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
                <li className="list-disc md:ml-20">
                  Les plans des locaux, avec indication des zones à risques
                  spécifiques (incendie, explosion)
                </li>
                <li className="list-disc md:ml-20">
                  Les schémas unifilaires et un synoptique des tableaux
                  électriques
                </li>
                <li className="list-disc md:ml-20">
                  Le rapport de vérification initiale et les rapports des
                  vérifications périodiques précédentes
                </li>
                <li className="list-disc md:ml-20">
                  Pour les zones à risques d&apos;explosion, les déclarations CE
                  de conformité et les notices d&apos;instruction des matériels
                </li>
                <li className="list-disc md:ml-20">
                  Un descriptif des installations de sécurité et l&apos;effectif
                  maximal des différents locaux ou bâtiments
                </li>
              </ul>
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Conformité réglementaire : le cadre légal
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            La vérification périodique des installations électriques est une
            obligation réglementaire, notamment stipulée par l&apos;article
            R.4226-16 du Code du travail.
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Au-delà de la vérification : la thermographie infrarouge pour une
            prévention optimale (Contrôle Q19 en option)
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            En complément de la vérification périodique, fm4all propose
            également la thermographie infrarouge. Cette technique permet de :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Détecter les échauffements anormaux : Identifiez les points chauds
              susceptibles de provoquer des coupures ou des départs de feu,
              souvent invisibles lors d&apos;un contrôle visuel classique
            </li>
            <li className="list-disc">
              Obtenir le certificat APSAD Q19 : Un atout pour votre assureur
            </li>
            <li className="list-disc">
              Renforcer la sécurité : Prévenez les incendies d&apos;origine
              électrique et protégez vos collaborateurs et vos locaux
            </li>
            <li className="list-disc">
              Optimiser la maintenance : Mettez en place une maintenance
              préventive efficace et non intrusive
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Notre méthodologie en thermographie infrarouge :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Identification précise des installations et matériels à contrôler
            </li>
            <li className="list-disc">
              Vérification et demande de mise en charge des installations pour
              une thermographie efficace
            </li>
            <li className="list-disc">
              Paramétrage précis de la caméra en fonction de chaque mesure
            </li>
            <li className="list-disc">
              Balayage et contrôle thermographique des installations
            </li>
            <li className="list-disc">
              Analyse approfondie des images et des écarts de température
            </li>
            <li className="list-disc">Édition de clichés thermographiques</li>
            <li className="list-disc">
              Rédaction d&apos;un rapport de contrôle complet
            </li>
            <li className="list-disc">
              Fourniture de la déclaration Q19 de l&apos;APSAD
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Pour plus d&apos;informations sur nos services de vérification des
            installations électriques et de thermographie infrarouge,
            contactez-nous dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous en visio
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Respirez un air sain dans vos locaux avec fm4all : Évaluation
            annuelle de l&apos;aération
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Option incluse dans les forfaits Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            fm4all vous accompagne dans la mise en œuvre de la surveillance de
            la qualité de l&apos;air intérieur (QAI) dans vos Établissements
            Recevant du Public (ERP). Notre offre d&apos;évaluation annuelle des
            moyens d&apos;aération des bâtiments, incluant la mesure du dioxyde
            de carbone (CO2), vous permet de garantir un renouvellement
            d&apos;air optimal et de respecter les obligations réglementaires en
            vigueur.
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Pourquoi une évaluation annuelle de l&apos;aération est-elle
            essentielle ?
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            La qualité de l&apos;air intérieur a un impact direct sur la santé
            et le bien-être des occupants de vos ERP, notamment les populations
            sensibles (enfants, personnes âgées, etc.). Une mauvaise aération
            peut entraîner des problèmes de santé, une baisse de la
            concentration et une augmentation de l&apos;absentéisme.
            L&apos;évaluation annuelle, rendue obligatoire par la
            réglementation, permet de :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Vérifier l&apos;efficacité de votre système d&apos;aération :
              Mesurer en temps réel le renouvellement de l&apos;air et
              identifier les éventuels dysfonctionnements
            </li>
            <li className="list-disc">
              Garantir un environnement sain : Assurer un air intérieur de
              qualité pour le confort et la santé des occupants
            </li>
            <li className="list-disc">
              Respecter les obligations légales : Être en conformité avec le
              Code de l&apos;environnement et les décrets et arrêtés de fin
              décembre 2022
            </li>
            <li className="list-disc">
              Anticiper les risques : Prévenir les problèmes liés à une mauvaise
              qualité de l&apos;air intérieur, tels que la propagation des virus
              et les allergies
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Notre mission : une évaluation précise et complète
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            La première évaluation annuelle doit être réalisée au plus tard en
            2024. Notre intervention concerne les pièces suivantes :
            classes/salles d&apos;activité, dortoirs, cantines/salles de
            restauration et salles polyvalentes (activités sportives…)
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Notre méthodologie
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Sélection des pièces à contrôler :
              <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
                <li className="list-disc md:ml-20">
                  Moins de 6 pièces éligibles : Nous évaluons l&apos;ensemble
                  des pièces
                </li>
                <li className="list-disc md:ml-20">
                  6 pièces éligibles ou plus : Nous réalisons l&apos;évaluation
                  sur un échantillon représentatif de 50% des pièces (minimum 5
                  pièces), réparties dans les différents bâtiments et étages.
                  L&apos;évaluation de 20 pièces est considérée comme suffisante
                </li>
                <li className="list-disc md:ml-20">
                  Pièces éligibles : Seules les classes/salles d&apos;activité,
                  dortoirs, cantines/salles de restauration et salles
                  polyvalentes (activités sportives) sont prises en compte. Les
                  bureaux, cuisines, salles de change, sanitaires, couloirs,
                  locaux techniques, logements et salles réservées aux
                  enseignants sont exclus.
                </li>
              </ul>
            </li>
            <li className="list-disc">
              Analyse de l&apos;établissement : Nous étudions la configuration
              de votre établissement, y compris le mode d&apos;aération ou de
              ventilation principal, et les spécificités de chaque pièce
              examinée (localisation, mode d&apos;aération, état des bouches et
              grilles de ventilation, ouvrants)
            </li>
            <li className="list-disc">
              Mesure du CO2 : Pour chaque salle, nous effectuons une mesure
              directe de la concentration en dioxyde de carbone en période de
              chauffe et en conditions normales d&apos;exploitation, sur une
              durée minimale de 2 heures pendant la période d&apos;occupation
              présentant le risque de confinement le plus élevé
            </li>
            <li className="list-disc">
              Interprétation des résultats : Nous comparons les valeurs mesurées
              aux seuils de référence :
              <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
                <li className="list-disc md:ml-20">
                  &lt; 800 ppm : Renouvellement de l&apos;air satisfaisant
                </li>
                <li className="list-disc md:ml-20">
                  800 ppm : Actions correctives nécessaires
                </li>
                <li className="list-disc md:ml-20">
                  1500 ppm : Renouvellement de l&apos;air insuffisant, actions
                  urgentes à mettre en place
                </li>
              </ul>
            </li>
            <li className="list-disc">
              Rapport détaillé : Nous vous fournissons un rapport complet
              documentant nos constats et nos recommandations
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Conformité réglementaire
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Cette surveillance est réalisée en application des articles R221-30
            à 37 du Code de l&apos;environnement.
          </p>
          <p className="text-lg hyphens-auto text-wrap font-bold">
            Évolution réglementaire au 1er janvier 2025
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            À partir du 1er janvier 2025, la surveillance de la QAI sera
            également obligatoire pour :
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Les structures sociales et médico-sociales rattachées aux
              établissements de santé
            </li>
            <li className="list-disc">
              Les établissements mentionnés aux 1, 2, 4, 6, 7 et 12 du I de
              l’article L. 312-1 du Code de l’action sociale et des familles
            </li>
            <li className="list-disc">
              Les établissements pour mineurs mentionnés à l’article R. 124-9 du
              Code de la justice pénale pour mineurs
            </li>
          </ul>
          <p className="text-lg hyphens-auto text-wrap font-bold">Exclusions</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Sont exclus les locaux à pollution spécifique visés par l’article
            R4222-3 du Code du travail et les établissements d&apos;activités
            physiques et sportives couverts dans lesquels sont pratiquées des
            activités aquatiques.
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            Contactez fm4all pour une évaluation de la qualité de l&apos;air
            dans vos locaux et ERP.
          </p>
          <div className="flex flex-col items-center justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link
                href="https://calendly.com/romuald-fm4all/rdv-fm4all"
                target="_blank"
              >
                Je prends un rendez-vous en visio
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="tel:+33669311046">Je contacte par téléphone</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
              asChild
            >
              <Link href="mailto:contact@fm4all.com">
                Je contacte par e-mail
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
