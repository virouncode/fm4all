import { MesSitesClientsClient } from "./MesSitesClientsClient";

export default function MesSitesClientsPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Mes sites clients</h1>
      <MesSitesClientsClient />
    </div>
  );
}
