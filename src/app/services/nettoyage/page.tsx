import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Nettoyage",
  description:
    "Du nettoyage essentiel à une expérience 5 étoiles, du prestataire PM au grand groupe, choisissez la prestation Propreté qui vous ressemble",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Nettoyage</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Du nettoyage essentiel à une expérience 5 étoiles, du prestataire
            PME au grand groupe, choisissez la prestation Propreté qui vous
            ressemble.
          </p>
          <div className="md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/nettoyage.png"}
              alt="illustration-nettoyage"
              quality={100}
              className="w-full h-full object-cover"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Le nettoyage est primordial pour le bien-être au travail. Bien
            au-delà de l’importance d’un environnement sain pour limiter les
            risques de maladies, un espace propre et rangé contribue à faciliter
            le travail et à renforcer l’engagement des collaborateurs.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl">Quelle gamme de services choisir ?</p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Pour simplifier vos choix, fm4all a préparé des cahiers des charges
            professionnels avec des fréquences de passage adaptées à chaque
            gamme. Voici un résumé des avantages de chaque formule :
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
