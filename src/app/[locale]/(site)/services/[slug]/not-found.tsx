import BackButton from "@/components/buttons/back-button";
import { useLocale } from "next-intl";

export default function NotFoundPage() {
  const locale = useLocale();

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mt-4 flex flex-col gap-6">
        <h2 className="text-center text-lg font-bold text-red-500">
          {locale === "fr"
            ? "Erreur 404 : Page non trouvée !"
            : "404 Error: Page not found!"}
        </h2>
        <p className="text-center">
          {locale === "fr"
            ? "Ce service n'existe pas"
            : "This service doesn't exist"}
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
