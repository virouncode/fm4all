import { MesSitesClientsClient } from "./MesSitesClientsClient";

export default function MesSitesClientsPage() {
  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <h1 className="mb-6 flex-shrink-0 text-2xl font-bold">
        Mes sites clients
      </h1>
      <div className="flex-1 overflow-y-auto">
        <MesSitesClientsClient />
      </div>
    </div>
  );
}
