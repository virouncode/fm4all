import { LayoutDashboard } from "lucide-react";
import { DashboardClient } from "./DashboardClient";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex shrink-0 items-center gap-2">
        <LayoutDashboard className="text-primary size-5" />
        <h1 className="text-xl font-bold">Tableau de bord</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        <DashboardClient />
      </div>
    </div>
  );
}
