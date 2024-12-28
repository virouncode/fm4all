import ImgCardHorizontal from "@/components/cards/ImgCardHorizontal";
import { Euro, HandPlatter, House, ReceiptText, Star } from "lucide-react";

const Process = () => {
  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6 mt-10"
      id="process"
    >
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">
        Comment ça marche ?
      </h2>
      <div className="flex flex-wrap justify-center align-center gap-x-24 gap-y-8">
        <ImgCardHorizontal
          src="/img/ourprocess1.png"
          alt="notre-process-1-logo"
        >
          <div className="flex-1">
            <h3 className="text-xl">1. MES LOCAUX</h3>
            <div className="flex gap-2 items-center">
              <House size={30} />
              <p>
                Je précise m<sup>2</sup>, type et effectif
              </p>
            </div>
          </div>
        </ImgCardHorizontal>
        <ImgCardHorizontal
          src="/img/ourprocess2.png"
          alt="notre-process-2-logo"
        >
          <div className="flex-1">
            <h3 className="text-xl">2. MES SERVICES</h3>
            <div className="flex gap-2 items-center">
              <HandPlatter size={40} />
              <p>Je sélectionne ce qui m&apos;intéresse à la carte</p>
            </div>
          </div>
        </ImgCardHorizontal>
        <ImgCardHorizontal
          src="/img/ourprocess3.png"
          alt="notre-process-2-logo"
        >
          <div className="flex-1">
            <h3 className="text-xl">3. MES GAMMES</h3>
            <div className="flex gap-2 items-center">
              <Star size={40} />
              <p>Je choisis le niveau de chaque service</p>
            </div>
          </div>
        </ImgCardHorizontal>
        <ImgCardHorizontal
          src="/img/ourprocess4.png"
          alt="notre-process-3-logo"
        >
          <div className="flex-1">
            <h3 className="text-xl">4. MES PRIX</h3>
            <div className="flex gap-2 items-center">
              <Euro size={40} />
              <p>Je compare en ligne mes prestataires</p>
            </div>
          </div>
        </ImgCardHorizontal>
        <ImgCardHorizontal
          src="/img/ourprocess5.png"
          alt="notre-process-4-logo"
        >
          <div className="flex-1">
            <h3 className="text-xl">5. MON CONTRAT</h3>
            <div className="flex gap-2 items-center">
              <ReceiptText size={40} />
              <p>Je valide la date de démarrage et go 🚀 !</p>
            </div>
          </div>
        </ImgCardHorizontal>
      </div>
    </section>
  );
};

export default Process;
