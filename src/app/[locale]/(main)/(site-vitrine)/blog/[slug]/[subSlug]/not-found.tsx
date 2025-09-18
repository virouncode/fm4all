import BackButton from "@/components/buttons/back-button";
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mt-4 flex flex-col gap-6">
        <h2 className="text-center text-lg font-bold text-red-500">
          {t("erreur-404-page-non-trouvee")}
        </h2>
        <p className="text-center">{t("cet-article-nexiste-pas")}</p>

        <BackButton title={t("retour")} size="lg" className="text-base" />
      </div>
    </div>
  );
}
