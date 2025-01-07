import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisDataProvider from "@/context/DevisDataProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import Total from "../Total";
import MesLocaux from "./MesLocaux";

const page = () => {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <DevisProgressProvider>
        <DevisBreadcrumb currentStepId={1} />
      </DevisProgressProvider>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Mes locaux</h1>
        <Total />
      </div>
      <section className="flex flex-col gap-10 h-full flex-1">
        <DevisProgressProvider>
          <DevisDataProvider>
            <MesLocaux />
          </DevisDataProvider>
        </DevisProgressProvider>
      </section>
    </main>
  );
};

export default page;
