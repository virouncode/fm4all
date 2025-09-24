import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
    locale === "fr" ? "Nous contacter" : "Contact us",
    locale === "fr"
      ? "Contactez-nous pour des questions sur nos services de facility managment"
      : "Contact us for questions about our facility management services",
  );
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
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
            <BreadcrumbPage>{t("nous-contacter")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="mt-6 flex flex-col gap-10 md:gap-20">
        <h1 className="text-4xl">{t("nous-contacter")}</h1>
        <div className="mx-auto flex max-w-prose flex-col items-center gap-6 text-wrap hyphens-auto">
          <p>{t("des-questions-sur-nos-services-ou-nos-offres-en-general")}</p>
          <p>{t("nous-sommes-la")}</p>
        </div>
        <div className="flex flex-col gap-8">
          <CTAContactButtons />
          <div className="flex w-full items-center justify-center gap-4">
            <Avatar className="size-14">
              <AvatarImage
                src="/img/portrait-dg.webp"
                alt="Portrait de Romuald Buffe, dirigeant de FM4ALL"
                className="object-cover"
              />
            </Avatar>
            <p className="text-center">{t("romuald-buffe-dirigeant-fm4all")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
