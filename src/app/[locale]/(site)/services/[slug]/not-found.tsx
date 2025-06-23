import BackButton from "@/components/buttons/back-button";
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");
  console.log("NotFoundPage Service rendered");

  return (
    <div className="flex items-center justify-center mx-auto h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="font-bold text-lg text-center text-red-500">
          {t("erreur-404-page-non-trouvee")}
        </h2>
        <p className="text-center">{t("ce-service-nexiste-pas")}</p>
        <BackButton title={t("retour")} size="lg" className="text-base" />
      </div>
    </div>
  );
}
