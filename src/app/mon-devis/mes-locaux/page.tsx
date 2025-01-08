import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import MesLocaux from "./MesLocaux";

const page = () => {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <DevisBreadcrumb currentStepId={1} />
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl">Mes locaux</h1>
        <p className="text-lg text-center">
          5 informations seulement pour obtenir tous vos devis
        </p>
      </div>
      <section className="flex flex-col gap-10 h-full flex-1">
        <MesLocaux />
      </section>
    </main>
  );
};

export default page;
