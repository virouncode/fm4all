import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Foire aux questions sur les services de fm4All",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl">Foire aux questions</h1>
        <div className="flex flex-col gap-6 text-lg mx-auto w-full max-w-prose">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">Vous payez trop cher ?</h2>
            <p>
              Sur fm4all, comparez des centaines de devis aux meilleurs prix en
              quelques clics.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">Vous voulez de meilleurs tarifs ?</h2>
            <p>
              Sur fm4all, bénéficiez de tarifs groupés négociés, d&apos;une
              garantie qualité et d&apos;un suivi professionnel.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Marre d&apos;avoir des prix à la tête du client ?
            </h2>
            <p>
              Sur fm4all, obtenez vos tarifs en quelques clics, en toute
              transparence.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">Vous déménagez ?</h2>
            <p>
              Sur fm4all, mettez en place tous les services nécessaires au bon
              fonctionnement de vos bureaux. Nous réalisons vos contrats et vos
              cahiers des charges. Nous accompagnons votre installation dans les
              meilleurs délais.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Vous vous agrandissez ? Besoin de professionnaliser la gestion de
              vos bureaux ?
            </h2>
            <p>
              Avec fm4all, déléguez la gestion de tous vos contrats de services
              à un office manager.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Gérez le nettoyage n&apos;est pas votre cœur de métier ?
            </h2>
            <p>
              Chez fm4all, nous gérons les services du quotidien pour que vos
              équipes se focalisent sur leurs vrais métiers.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Envie d&apos;attirer et retenir des talents ? De créer une
              identité à vos bureaux qui vous ressemble ?
            </h2>
            <p>
              Passez à un service 5 étoiles : chez fm4all, nous mettons en place
              un service hospitality et animons vos bureaux selon votre image.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              La sécurité de vos collaborateurs est importante pour vous ?
            </h2>
            <p>
              Avec fm4all, transférez vos risques et assurez-vous de la
              conformité réglementaire de vos locaux.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">Marre de courir après des devis ?</h2>
            <p>
              Sur fm4all, obtenez des tarifs pour tous vos services au bureau en
              quelques clics.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Vous n&apos;êtes pas expert en achats de services ?
            </h2>
            <p>
              Essentiel, Confort ou Excellence, nous simplifions vos choix pour
              vous permettre d&apos;acheter comme des experts.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              Pas le temps ni les ressources pour écrire un Cahier des Charges ?
              <br />
              Gérer un appel d&apos;offres ou obtenir des devis est chronophage
              ?
            </h2>
            <p>
              Sur fm4all, en moins de 5 min, construisez une offre de facility
              management qui vous ressemble. Rassemblez tous les services de vos
              bureaux sous un seul contrat, une seule facture et un seul
              interlocuteur. Gagner du temps et de l&apos;argent.
            </p>
          </div>
        </div>
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
            <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
          </Button>
        </div>
      </article>
    </main>
  );
};

export default page;
