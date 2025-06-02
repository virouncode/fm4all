import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth-session";
import { getLocale } from "next-intl/server";

export default async function AuthRedirect() {
  // Get the user from the session
  const user = (await getSession())?.user;
  const locale = await getLocale();
  // If no user is found, redirect to signin
  if (!user) {
    redirect({ locale, href: "/auth/signin" });
  }

  // Redirect based on user role
  if (user?.role === "admin") {
    redirect({
      locale,
      href: {
        pathname: "/admin/[adminId]",
        params: { adminId: user.id },
      },
    });
  } else if (user?.role === "client") {
    redirect({
      locale,
      href: {
        pathname: "/client/[clientId]",
        params: { clientId: user.clientId ?? 0 },
      },
    });
  } else if (user?.role === "fournisseur") {
    redirect({
      locale,
      href: {
        pathname: "/fournisseur/[fournisseurId]/dashboard",
        params: { fournisseurId: user.fournisseurId ?? 0 },
      },
    });
  } else {
    // Default redirect if role is not recognized
    // redirect("/dashboard");
  }

  // This is just a fallback and should never be displayed
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirection en cours...</p>
    </div>
  );
}
