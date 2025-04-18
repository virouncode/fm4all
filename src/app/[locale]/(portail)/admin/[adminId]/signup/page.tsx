import { getClients } from "@/lib/queries/clients/getClients";
import { getFournisseurs } from "@/lib/queries/fournisseurs/getFournisseurs";
import SignUp from "./Signup";

const page = async () => {
  const [fournisseurs, clients] = await Promise.all([
    getFournisseurs(),
    getClients(),
  ]);
  return <SignUp fournisseurs={fournisseurs} clients={clients} />;
};

export default page;
