import BackButton from "@/components/buttons/back-button";
import { getLocale } from "next-intl/server";

export default async function NotFoundPage() {
  const locale = await getLocale();
  return (
    <div className="flex items-center justify-center mx-auto h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="font-bold text-lg text-center text-red-500">
          {locale === "fr"
            ? "Erreur 404 : Page non trouvée !"
            : "404 Error: Page not found!"}
        </h2>
        <p className="text-center">
          {locale === "fr"
            ? "Ce fournisseur n'existe pas"
            : "This supplier doesn't exist"}
        </p>

        <BackButton
          title={locale === "fr" ? "Retour" : "Back"}
          size="lg"
          className="text-base"
        />
      </div>
    </div>
  );
}
