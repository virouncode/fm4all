import { getSession } from "@/lib/auth-session";
import { SelectUserType } from "@/zod-schemas/user";
import AdminInfo from "./AdminInfo";

const page = async () => {
  const sessionData = await getSession();
  const user = sessionData?.user as SelectUserType | undefined | null;
  if (!user) return <div>Utilisateur introuvable</div>;

  return <AdminInfo info={user} />;
};

export default page;
