import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import MesServices from "./MesServices";

const page = () => {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 h-[calc(100vh-4rem)] flex flex-col gap-4">
      <DevisBreadcrumb currentStepId={2} />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Mes services</h1>
      </div>
      <MesServices />
    </main>
  );
};

export default page;
