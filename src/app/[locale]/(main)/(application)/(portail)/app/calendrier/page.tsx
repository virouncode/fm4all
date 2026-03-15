import { CalendarDays } from "lucide-react";
import { CalendrierClient } from "./CalendrierClient";

export default function CalendrierPage() {
  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <CalendarDays className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Calendrier</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CalendrierClient />
      </div>
    </div>
  );
}
