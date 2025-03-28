import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le FM",
  description: "Qu'est-ce qu'un facility manager ?",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-3xl md:text-4xl">Le FM c&apos;est quoi ?</h1>
          <Button
            variant="outline"
            className="flex items-center justify-center text-base"
            asChild
            size="lg"
          >
            <Link href="/articles">Revenir aux articles</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-6 text-lg w-full max-w-prose mx-auto hyphens-auto text-wrap">
          <h2 className="font-bold">
            Le FM a plusieurs noms : Facility Management, IFM comme Integrated
            Facility Management, Facility services ou IFS, integrated facility
            services.
          </h2>
          <p>
            Globalement, le FM consiste à externaliser la maintenance du
            bâtiment, mais aussi de confier/externaliser tout ou partie de la
            gestion de ces prestataires de services au bâtiment.
          </p>
          <p>Cela pourrait se traduire en français par :</p>
          <ul className="ml-6 md:ml-14">
            <li className="list-disc">Gestion des équipements du bâtiment</li>
            <li className="list-disc">
              Gestion déléguée de services au bâtiment
            </li>
            <li className="list-disc">
              Management externalisé des Services Généraux
            </li>
            <li className="list-disc">
              Gestion de l&apos;Environnement de travail
            </li>
            <li className="list-disc">...</li>
          </ul>
          <p>
            En résumé, puisqu&apos;il n&apos;y a pas une seule définition du FM,
            il n&apos;y a pas une seule bonne traduction non plus.
          </p>
          <p>
            Tous les clients n&apos;achètent pas, ni ne délèguent de la même
            manière la gestion de leurs bâtiments.
          </p>
          <p>
            Les entreprises de FM, ayant des backgrounds très différents, elles
            n&apos;offrent pas non plus les mêmes niveaux de services. Il
            n&apos;y a pas la même sensibilité d&apos;une entreprise à
            l&apos;autre.
          </p>
          <p>
            Si nous devions vulgariser un peu... Nous aurions 4 niveaux
            d&apos;externalisation : Gestion interne, achats service par
            service, multi services et IFM.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Gestion interne des services
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Il n&apos;y a pas si longtemps (30 ans tout de même), les
              entreprises géraient en interne leurs prestations. Vous aviez des
              employés de nettoyage, du personnel d&apos;accueil, des
              techniciens, un responsable reprographie... Et tout ce beau monde
              était en CDI chez vous.
            </p>
            <p>
              Achat de produits, éponges, chariots, ... gérer les congés, les
              absences... Absence imprévue du personnel d&apos;accueil à 8h ?
              Compliqué...
            </p>
            <p>
              Sans le réseau, ni les méthodes, ni les outils, la gestion de ces
              prestations en interne était chronophage et peu optimisée.
            </p>
            <p>
              Je vous invite à lire notre article sur l&apos;
              <Link
                className="underline text-blue-500"
                href="/articles/histoire-du-nettoyage"
              >
                histoire du nettoyage: Des femmes de ménage au nettoyage
                industriel.
              </Link>{" "}
              La dynamique d&apos;évolution est très similaire.
            </p>
            <p className="font-bold">Avantages</p>
            <p>
              Sentiment d&apos;appartenance ? Difficile d&apos;en trouver
              d&apos;autres aujourd&apos;hui. Si la valeur de l&apos;entreprise
              aurait pu être un point fort, les prestataires s&apos;intègrent
              tellement bien aujourd&apos;hui que cela n&apos;est plus un
              argument. Evolution interne ? Plutôt voie de garage
              lorsqu&apos;aucun plan de carrière ou de formation ne sont
              proposés. Il y a de très beaux retours d&apos;expérience de
              salariés qui sont passées côté prestataire, avec de belles
              carrières à la clé.
            </p>
            <p className="font-bold">Inconvénients</p>
            <p>
              Peu optimisé = cher en ressource, en temps, en risques sociaux et
              professionnels (TMS, etc.). La liste est longue.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            Externalisation Mono Services
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Il y a 30 ans, devant la demande des entreprises, la
              professionnalisation par métier a commencé à exploser (
              <Link
                href="/articles/lexternalisation-du-fm"
                className="underline text-blue-500"
              >
                l&apos;histoire de l&apos;externalisation du FM
              </Link>
              ). De nombreuses entreprises de services au bâtiment se sont
              créées et ont grossi. Toutes ont offert des services, avec plus ou
              moins de professionnalisme et plus ou moins de probité sur les
              niveaux de marges. Le multi services existait déjà, mais en
              France, le mono service était la norme.
            </p>
            <p>
              Ce modèle est encore présent dans certaines moyennes et grandes
              entreprises.
            </p>
            <p>
              Chez les clients, certains conservent de grosses équipes en
              interne de services généraux / DET (Direction de
              l&apos;Environnement de Travail).
            </p>
            <p>
              Ils achètent eux-même service par service et les encadrent au
              quotidien.
            </p>
            <p>
              Nettoyage, accueil, sécurité incendie, ascensoriste... tout est
              piloté en interne. Sur la partie maintenance technique, certains
              conservent des responsables techniques et achètent lot par lot
              plutôt que d&apos;embaucher un prestataire multi techniques.
            </p>
            <p className="font-bold">Avantages</p>
            <p>
              Pour les grandes entreprises, créer une équipe assez grande de
              Services Généraux / Direction immobilière / DET, est tout à fait
              possible. Avec plus d&apos;une dizaine de collaborateurs dédiés à
              ces fonctions, ce sont des compétences internes que vous pouvez
              professionnaliser. Intégrée à la structure, la fonction est
              adaptée à la vie et aux besoins de l&apos;entreprise.
            </p>
            <p className="font-bold">Inconvénients</p>
            <p>
              Au même titre que vous n&apos;êtes pas expert pour encadrer des
              agents de nettoyage, vous ne l&apos;êtes pas non plus pour
              recruter, former et encadrer un pilote en interne sur
              l&apos;ensemble de ces services. Vous n&apos;avez pas de formation
              interne, ni plan de carrière, ni remplacement facile pour cette
              fonction. Ce n&apos;est pas votre coeur d&apos;activité.
            </p>
            <p>Et côté finances ?</p>
            <p>
              Les plus: bien acheté, vous conservez la marge du FMeur pour vous.
            </p>
            <p>
              Les moins : nécessite compétence pour optimiser, bien acheter...
              et du volume achats.
            </p>
            <p>
              Vous conservez aussi le risque et la responsabilité des
              prestataires de services, qualité, résiliation, etc.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            FM multi services
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Premiers pas vers l&apos;externalisation des services, les
              prestations sont regroupées par lots.
            </p>
            <p>
              Hard FM / Services Multi technique : Toutes les prestations liées
              à la Maintenance technique du bâtiment (chaud, froid, eau,
              ascenseurs, sécurité incendie, contrôles règlementaires...)
            </p>
            <p>
              Soft FM / Services aux occupants : Prestations de services au
              bâtiment hors maintenance technique. Cela inclut entre autres
              nettoyage, espace vert, accueil, food & beverage...
            </p>
            <p>Et parfois, peuvent encore être séparé selon les usages :</p>
            <ul className="ml-14 mt-4">
              <li className="list-disc">Sûreté / Sécurité</li>
              <li className="list-disc">
                Restauration / Catering / Food & beverage
              </li>
            </ul>
            <p className="font-bold">Avantages</p>
            <p>
              Massification : en regroupant par lots, on donne plus de chiffre
              d&apos;affaires à un prestataire. Cela lui permet de mettre plus
              d&apos;encadrement et d&apos;optimiser les prestations, les
              passages, etc.
            </p>
            <p>
              Professionnalisation du pilotage : Ce sont des experts métiers qui
              pilote les prestations.
            </p>
            <p>Réduction du nombre d&apos;interlocuteurs et de factures.</p>
            <p className="font-bold">Inconvénients</p>
            <p>
              Nécessite de conserver des personnes chez vous pour piloter et
              contrôler ces prestataires. Il faut faire attention au
              mille-feuille de management. Le prestataire FM aura besoin
              d&apos;un encadrant (dédié ou non) pour ses prestations. Il ne
              faudra pas que ce management fasse doublon avec vos équipes (
              <Link
                href="/articles/le-fm-fait-il-faire-des-economies"
                className="underline text-blue-500"
              >
                le FM fait-il faire des économies ?
              </Link>
              ).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            IFM / Facility Management intégré
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Solution adoptée depuis de nombreuses années par nos amis
              nordiques et anglo-saxons, c&apos;est l&apos;externalisation
              complète de la gestion des prestataires de services. Hard, Soft,
              Restauration, carfleet, etc. C&apos;est une entreprise et son
              Responsable dédié qui va veiller au bon fonctionnement de votre
              bâtiment.
            </p>
            <p>
              En forte croissance à l&apos;international depuis les années 2000,
              dans l&apos;hexagone depuis 10 ans, c&apos;est la nouvelle
              tendance dans les grandes entreprises.
            </p>
            <p>
              Externalisation totale ou partielle, cette tendance vise à
              professionnaliser la fonction de Facility Manager / Responsable de
              bâtiment.
            </p>
            <p>
              Chez les clients, on délègue la gestion du quotidien aux FMeurs
              pour se concentrer sur la gestion stratégique du bâtiment :
              Immobilier, QVT, RSE, ESG, vie au bureau, aménagement,
              investissements, ... autant de sujets au coeur de la DET ou de la
              direction immobilière, auparavant écrasés par la charge des sujets
              du quotidiens sans réelle valeur ajoutée.
            </p>
            <p className="font-bold">Avantages</p>
            <p>
              Professionnalisation du pilotage : vous avez des personnes
              compétentes en management de services, de métiers, dédiées à ces
              tâches. Elles sont animées par une entreprise proposant formation
              et évolution spécifiques à ces fonctions.
            </p>
            <p>
              Pas de doublon, vous optimisez la gestion de services via
              l&apos;externalisation complète.
            </p>
            <p>Gain de temps : Les sujets du quotidien sont pris en charge.</p>
            <p>Une seule facture, un seul interlocuteur, gain d&apos;argent.</p>
            <p>
              Continuité de services : Congés, maladie, absence imprévue, vous
              n&apos;avez plus de question à vous poser.
            </p>
            <p>
              Garantie qualité : vous avez transféré le risque contractuel et
              qualité. Votre prestataire FM doit trouver les solutions pour
              vous.
            </p>
            <p>
              Vous bénéficiez d&apos;outils professionnels (habituellement chers
              à développer pour une seule entreprise).
            </p>

            <p className="font-bold">Inconvénients</p>
            <p>
              Vous avez moins d&apos;expertise en interne sur les services
              généraux.
            </p>
            <p>Vous devez trouver un bon prestataire de confiance.</p>
            <p>
              Le changement de prestataire est moins évident en FM qu&apos;en
              mono service.
            </p>
            <p>
              Vous devez veiller à ce qu&apos;il n&apos;y ait pas trop
              d&apos;intermédiaires (équilibre financier global).
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            HM / Hospitality Management
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              J&apos;allais oublier LA dernière tendance. En effet, le happiness
              management existait avant COVID. Mais depuis que la présence au
              bureau a changé d&apos;objectif et de sens, les métiers de
              hospitality/happiness management ont connu un boom.
            </p>
            <p>
              On parle d&apos;&quot;hôtelification&quot; du lieu de travail.
            </p>
            <p>On cherche à créer une expérience pour les collaborateurs.</p>
            <p>
              On ne vient plus pour travailler derrière un bureau. On vient pour
              échanger avec ses collègues, créer du lien, prendre une piqûre
              corporate avant de retourner chez soi en télétravail.
            </p>
            <p>
              On améliore le bien être au travail, tout en gagnant en
              attractivité et en rétention de talents !
            </p>
            <p>
              L&apos;IFM et l&apos;hospitality Management semblent gagner les
              suffrages ?
            </p>
            <p>
              Oui mais attention, il faut avoir des tailles critiques de
              bâtiment assez importantes pour pouvoir les mettre en place sans
              surcoût majeur.
            </p>
            <p>
              Ou il faut investir dans l&apos;hospitality comme outil RH à part
              entière.
            </p>
            <p>
              L&apos;entre deux choisi par beaucoup d&apos;entreprises
              n&apos;ayant pas cette taille critique a été les bâtiments de
              services. Entendre par là le co-working type WeWork.
            </p>
            <p>
              Le service est top, mais n&apos;est peut-être pas adapté aux
              attentes spécifiques de votre entreprise. Et bien sûr le coworking
              a un coût... qui peut décourager certains.
            </p>
            <p>
              Donc impossible d&apos;avoir un IFM pour ma PME/PMI sans exploser
              les budgets ?
            </p>
            <p>
              Mais si bien sûr ! Il fallait créer le service en face de ce
              besoin : fm4all est né.
            </p>
            <p>La devise ? Le Facility Management pour tous !</p>
            <p>
              La structure de pilotage, de gestion et d&apos;achat de fm4all est
              pensée pour pouvoir s&apos;adapter aux plus petites surfaces,
              comme aux plus grandes.
            </p>
            <p>Dès 50m², vous pouvez faire appel à nous !</p>
            <p>
              Offrez-vous à moindres frais, sur mesure, des bureaux avec
              services aux utilisateurs intégrés !
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
