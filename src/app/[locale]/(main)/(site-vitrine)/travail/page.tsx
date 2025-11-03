import CTAContactButtonsNoConversion from "@/components/buttons/cta-contact-buttons-no-conversion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "contact",
    locale,
    locale === "fr" ? "Travailler chez fm4all" : "Work at fm4all",
    locale === "fr"
      ? "Rejoignez l'équipe fm4all et contribuez à notre mission."
      : "Join the fm4all team and contribute to our mission.",
  );
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TravailPage");
  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={`/`} title={t("accueil")}>
                <HomeIcon size={14} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("carriere")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="mt-6 flex flex-col gap-10 text-lg md:gap-20">
        <h1 className="text-4xl">{t("rejoignez-nous")}</h1>
        <div className="flex flex-col gap-8">
          <div className="mx-auto flex max-w-prose flex-col items-center gap-6 text-center text-wrap hyphens-auto">
            <p>
              {t(
                "vous-cherchez-a-rejoindre-une-equipe-dynamique-et-engagee-dans-la-transformation-du-facility-management",
              )}
            </p>
            <p>{t("ecrivez-nous")}</p>
          </div>
          <div className="flex flex-col gap-8">
            <CTAContactButtonsNoConversion
              withVisio={false}
              withPhone={false}
              orientation="horizontal"
              email="emploi@fm4all.com"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
