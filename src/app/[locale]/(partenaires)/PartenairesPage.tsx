import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";
import Image from "next/image";
import Link from "next/link";
import Partenaires from "../../Partenaires";

export const metadata = {
  title: "Nos partenaires",
  description:
    "Avec nos partenaires, nous établissons une collaboration fondée sur la qualité et la confiance.",
};

const PartenairesPage = async () => {
  const t = await getScopedI18n("partnersPage");
  const t2 = await getScopedI18n("contactPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">{t("title")}</h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            {t("description")}
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/partenaires.webp"}
              alt="illustration-partenaires"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("intro.part1")} <strong>{t("intro.part2")}</strong>{" "}
            {t("intro.part3")} <strong>{t("intro.part4")}</strong>
          </p>
        </div>
        {/* Sections */}
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.selection.title")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.selection.description")}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t("sections.selection.criteria.experience")}
            </li>
            <li className="list-disc">
              {t("sections.selection.criteria.references")}
            </li>
            <li className="list-disc">
              {t("sections.selection.criteria.adaptability")}
            </li>
            <li className="list-disc">
              {t("sections.selection.criteria.compliance")}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.charter.title")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.charter.description")}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t("sections.charter.commitments.quality")}
            </li>
            <li className="list-disc">
              {t("sections.charter.commitments.transparency")}
            </li>
            <li className="list-disc">
              {t("sections.charter.commitments.environment")}
            </li>
            <li className="list-disc">
              {t("sections.charter.commitments.ethics")}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.followUp.title")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.followUp.description")}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t("sections.followUp.actions.audits")}
            </li>
            <li className="list-disc">
              {t("sections.followUp.actions.feedback")}
            </li>
            <li className="list-disc">
              {t("sections.followUp.actions.contact")}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.benefits.title")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.benefits.description")}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t("sections.benefits.items.visibility")}
            </li>
            <li className="list-disc">
              {t("sections.benefits.items.adminSupport")}
            </li>
            <li className="list-disc">{t("sections.benefits.items.growth")}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.community.title")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.community.description1")}
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("sections.community.description2")}
          </p>
        </div>
        <Partenaires />
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link
              href="https://calendly.com/romuald-fm4all/rdv-fm4all"
              target="_blank"
            >
              {t2("schedule_meeting")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="tel:+33669311046">{t2("contact_phone")}</Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="mailto:contact@fm4all.com">{t2("contact_email")}</Link>
          </Button>
        </div>
      </article>
    </main>
  );
};

export default PartenairesPage;
