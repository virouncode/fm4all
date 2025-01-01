import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DevisDataProvider from "@/context/DevisDataProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import MesServices from "./MesServices";

const page = () => {
  return (
    <main className="max-w-7xl mx-auto py-4 px-6 md:px-20 h-[calc(100vh-4rem)] flex flex-col">
      <DevisBreadcrumb currentStepId={2} />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Mes services</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="text-base">
              Total
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Total</SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <section className="flex flex-col gap-10 flex-1 py-6">
        <DevisProgressProvider>
          <DevisDataProvider>
            <MesServices />
          </DevisDataProvider>
        </DevisProgressProvider>
      </section>
    </main>
  );
};

export default page;
