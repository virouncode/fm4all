import { MesPrestatairesClient } from "./MesPrestatairesClient";

export default function MesPrestatairesPage() {
  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <h1 className="mb-6 flex-shrink-0 text-2xl font-bold">
        Mes prestataires
      </h1>
      <div className="flex-1 overflow-hidden">
        <MesPrestatairesClient />
      </div>
    </div>
  );
}
