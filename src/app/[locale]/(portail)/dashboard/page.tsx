import { getUser } from "@/lib/auth-session";
import DashboardAdmin from "./DashboardAdmin";
import DashboardClient from "./DashboardClient";
import DashboardFournisseur from "./DashboardFournisseur";

const page = async () => {
  const user = await getUser();
  switch (user?.role) {
    case "admin":
      return <DashboardAdmin />;
    case "client":
      return <DashboardClient />;
    case "fournisseur":
      return <DashboardFournisseur />;
    default:
      return <DashboardClient />;
  }
};

export default page;
