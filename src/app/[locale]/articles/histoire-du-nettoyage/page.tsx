import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histoire du nettoyage",
  description: "L'histoire du nettoyage industriel",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl">
            Histoire du Nettoyage : de la &quot;femme de ménage&quot; à
            l&apos;Agent de Service de nettoyage industriel
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
            Il y a plus de 30 ans, les agents de nettoyage (encore appelés
            &quot;femme de ménage&quot;) étaient directement des salariés des
            entreprises occupant les locaux.
          </h2>
          <p>
            Contrat de travail, recrutement, formation, remplacements pour
            absence... Ces mêmes entreprises se sont aperçues qu&apos;elles
            n&apos;avaient pas de compétence en interne pour encadrer et piloter
            ces métiers.
          </p>
          <p>L&apos;âge d&apos;Or des entreprises de nettoyage était né.</p>
          <p>
            Avec très peu de frein à l&apos;entrée, l&apos;investissement de
            départ se résumant à un chariot de ménage, un chasuble et quelques
            produits d&apos;entretien, de nombreuses entreprises se sont
            lancées.
          </p>
          <p>
            Il y avait encore peu de méthodes, peu de standardisation, cependant
            nous partions de tellement loin que la promesse de
            l&apos;externalisation était tenue : Moins cher et moins de
            contraintes de gestion.
          </p>
          <p>
            Niveaux de qualité très variables d&apos;un agent à l&apos;autre,
            mauvaises positions de travail, gestes répétitifs, la profession
            était sujette aux TMS (troubles musculo squelettiques).
          </p>
          <p>
            Sur fond de crise internationale, les entreprises clientes dont les
            marges n&apos;étaient plus à deux chiffres ont commencé à chercher
            des économies. Les frais de fonctionnement des bâtiments étaient une
            proie facile. Les clients ont professionnalisé leurs achats hors
            production.
          </p>
          <p>
            Représentant un des plus gros budgets de services, la propreté est
            vite passée en cible numéro un d&apos;économie.
          </p>
          <p>
            Les achats montaient gentiment en compétence et les services
            généraux voulaient garder la main. L&apos;un voulait des économies
            et l&apos;autre pas d&apos;ennui. Solution simple pour mettre tout
            le monde d&apos;accord ? Rogner sur la marge. A cette époque, les
            entreprises de nettoyage vivaient bien et pouvaient se le permettre.
          </p>
          <p>
            Les années passant, entre inflation, concurrence et
            professionnalisation des achats et services généraux clients, rogner
            la marge ne suffisait plus.
          </p>
          <p>
            L&apos;heure de l&apos;industrialisation du nettoyage était née.
          </p>
          <p>
            Lean Management, Méthode 5S, le chariot de ménage s&apos;est
            transformé en poste de travail et les cahier des charges en plan de
            séquencement organisé des tâches.
          </p>
          <p>
            Il n&apos;y avait plus de place à l&apos;amateurisme, il fallait
            professionnaliser la profession.
          </p>
          <p>
            Optimisation du séquencement des tâches, gestes et postures,
            matériel ergonomique...
          </p>
          <p>
            La standardisation des méthodes a permis d&apos;améliorer les
            cadences de travail, tout en améliorant la qualité et les conditions
            de travail.
          </p>
          <p>
            Formation, uniformes, valorisation du poste, moins de TMS, nos
            Agents de Service se professionnalisent.
          </p>
          <p>A la course à l&apos;économie, certains sont allés trop loin.</p>
          <p>
            La relation acheteur/prestataire a pris ce biais où il fallait dire
            qu&apos;on en faisait toujours plus, toujours mieux et pour moins
            cher. La course à l&apos;échalote.
          </p>
          <p>
            La formation des agents ne suivant pas toujours, les prix étant de
            plus en plus serrés, le paradigme de la relation entreprises de
            nettoyage et clients a amené les entreprises de nettoyage à trouver
            de la marge dans ce qu&apos;elles ne faisaient pas.
          </p>
          <p>
            Pas de remplacement en absence maladie, congés, vacances d&apos;été
            mal ou non remplacées, prestations périodiques non réalisées...
          </p>
        </div>
      </article>
    </main>
  );
};

export default page;
