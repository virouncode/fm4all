import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FM=économies ?",
  description:
    "Le Facility Management fait-il faire des économies ? Oui. Mais il faut savoir ce que l'on mesure et avoir des attentes réalistes !",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl">
            Le FM fait-il faire des économies ?
          </h1>
          <Button
            variant="outline"
            className="flex items-center justify-center text-base"
            asChild
            size="lg"
          >
            <Link href="/articles">Revenir aux articles</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
          <h2 className="font-bold">
            La réponse courte est &quot;Oui&quot;. Mais il faut savoir ce que
            l&apos;on mesure et avoir des attentes réalistes !<br />
          </h2>
          <p>
            La bonne gestion des prestations, leur optimisation et le volume
            d&apos;achat des FMeurs permet de{" "}
            <strong>réduire le coût des prestations de services</strong>, même
            avec des marges d&apos;exploitation FM.
          </p>
          <p>
            Si les prestations sont bien intégrées, le pilotage réalisé par
            chaque branche de service est réduit au profit du pilotage FM pour
            ne pas créer de surcoût ou de &quot;surqualité&quot;.
          </p>
          <p>
            A partir de ce point, bien mené, c&apos;est{" "}
            <strong>entre 10 et 20% d&apos;économie globale</strong> à terme
            (parfois immédiatement, parfois après 2 ans le temps de la
            transformation/réorganisation).
          </p>
          <p>
            Ce calcul ne fonctionne que si on valorise la fonction de pilotage
            FM. Dans votre organisation actuelle, il faut valoriser la charge de
            travail de ceux ou celles qui encadrent ou suivent les prestataires
            de services. Que ce soient les services généraux, l&apos;assistante
            de direction ou une charge de travail portée de façon diffuse, il y
            a du temps passé par vos équipes pour encadrer ces prestations.
          </p>
          <p>
            Le FM c&apos;est{" "}
            <strong>
              externaliser ces fonctions de support, professionnaliser la
              fonction pour libérer vos équipes
            </strong>
            . C&apos;est aussi{" "}
            <strong>passer de plusieurs factures à une seule</strong>, de
            multiples interlocuteurs à un seul, et globalement améliorer les
            prestations. Cette rationalisation globale est à intégrer dans vos
            économies.
          </p>
          <p>
            Pour les petites structures, on va chercher de l&apos;optimisation
            achats et de la sécurité. Dans les plus grandes organisations,
            certains vont chercher la rationalisation.
          </p>
          <p>
            Le FM ne supprime pas des postes à proprement parler, mais il les
            professionnalise.
          </p>
          <p>
            Sur de grosses équipes, la standardisation et l&apos;optimisation
            des tâches amènera sûrement à des réorganisations d&apos;équipes.
            Mais pas pour autant de licenciement ! Si il y a transfert du
            personnel vers le FMeurs, c&apos;est une nouvelle carrière et des
            opportunités qui se présentent.
          </p>
          <p>
            Nous sommes dans des métiers pénuriques !{" "}
            <strong>Les compétences, cela se garde précieusement</strong>. Donc
            on fait évoluer, on positionne, on reclasse, etc...Cela peut générer
            des économies opérationnelles sur le contrat d&apos;origine, tout en
            créant des opportunités ailleurs.
          </p>
          <p>
            Ce type de projet s&apos;intègre principalement dans des audits
            opérationnels à grande échelle. C&apos;est un procédé qui prend du
            temps et qui n&apos;est souvent proposé qu&apos;aux grandes
            entreprises. Les prestataires de FM sont eux-mêmes taillés
            uniquement pour gérer des gros projets.
          </p>
          <p className="text-center font-bold">
            Donc impossible pour ma PME/PMI ?
          </p>
          <p>
            Ça, c&apos;était avant !<br />
            Devant cette injustice et un besoin sur le marché non couvert,
            fm4all est arrivé.
          </p>
          <p className="text-center font-bold">
            La devise ? Le Facility Management pour tous !
          </p>
          <p>
            Nous avons des solutions d&apos;externalisation FM clé en main
            permettant à toute entreprise d&apos;optimiser ses prestations.
            <br />
            La structure de pilotage, de gestion et d&apos;achat est pensée pour
            pouvoir s&apos;adapter aux plus petites surfaces, comme aux plus
            grandes.
            <br />
            Dès 50m², vous pouvez faire appel à nous !
          </p>
          <p>Votre projet est plus complexe ? Prenez contact avec nous.</p>
        </div>
      </article>
    </main>
  );
};

export default page;
