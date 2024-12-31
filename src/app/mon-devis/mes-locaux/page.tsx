import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import DevisDataProvider from "@/context/DevisDataProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import MesLocaux from "./MesLocaux";

const page = () => {
  return (
    <main className="max-w-7xl mx-auto py-4 px-6 md:px-20 h-[calc(100vh-4rem)] flex flex-col">
      <DevisBreadcrumb currentStepId={1} />
      <h1 className="text-3xl md:text-4xl">Mes locaux</h1>
      <section className="flex flex-col gap-10 h-full py-6 flex-1">
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
