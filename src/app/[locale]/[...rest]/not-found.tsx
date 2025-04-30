import BackButton from "@/components/buttons/back-button";
import { getLocale } from "next-intl/server";

export default async function NotFoundPage() {
  const locale = await getLocale();
  return (
    <div className="flex items-center justify-center max-w-80 mx-auto h-dvh">
      <div className="flex flex-col gap-2 mt-4">
        <h2 className="font-bold text-lg text-center">
          {locale === "fr" ? "Page non trouvée !" : "Page not found !"}
        </h2>
        <BackButton
          title={locale === "fr" ? "Retour" : "Back"}
          size="lg"
          variant="outline"
          className="text-base"
        />
      </div>
    </div>
  );
}
