import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (session?.user) {
    redirect({ href: "/app", locale });
  }

  return <LoginForm />;
}
