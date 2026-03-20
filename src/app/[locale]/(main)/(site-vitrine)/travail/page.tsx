import CTAContactButtonsNoConversion from "@/components/buttons/cta-contact-buttons-no-conversion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon, Mail } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "travail",
    locale,
    locale === "fr" ? "Travailler chez fm4all" : "Work at fm4all",
    locale === "fr"
      ? "Rejoignez l'équipe fm4all et contribuez à notre mission."
      : "Join the fm4all team and contribute to our mission.",
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TravailPage");
  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <I18nLink href={`/`} title={t("accueil")}>
                <HomeIcon size={14} />
              </I18nLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("carriere")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl">{t("rejoignez-nous")}</h1>
        <Button
          size="lg"
          className="ring-primary flex items-center justify-center text-base ring-2 ring-offset-2 transition-all hover:scale-[101%]"
          asChild
        >
          <a
            href="mailto:emploi@fm4all.com"
            className="flex items-center justify-center gap-2"
            title={locale === "fr" ? "Contacter par email" : "Contact by email"}
          >
            <Mail />
            {locale === "fr" ? "Je contacte par email" : "Contact by e-mail"}
          </a>
        </Button>
      </div>

      <article className="flex flex-col gap-10">
        <h2 className="mx-auto max-w-prose font-bold text-wrap hyphens-auto">
          Rejoignez l&apos;équipe fm4all : façonnez l&apos;environnement de
          travail de demain
        </h2>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            Un rôle essentiel, au cœur de la performance de nos clients
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            Chez fm4all, nous sommes convaincus que la performance d’une
            entreprise passe avant tout par l&apos;expérience de ses occupants.
            En tant qu&apos;acteur du Facility Management (FM) nouvelle
            génération, notre mission est de transformer les bâtiments en lieux
            de vie et de travail fluides, sûrs, et durables.
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            Si vous êtes passionné par la gestion technique, l&apos;hospitalité,
            l&apos;innovation, et que vous souhaitez avoir un impact concret sur
            le quotidien de milliers de professionnels, votre place est chez
            nous.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            Pourquoi choisir fm4all ?
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              <strong>L&apos;Humain au Centre</strong> : Nous plaçons
              l&apos;occupant au cœur de nos préoccupations. Chaque membre de
              notre équipe contribue directement à la qualité de
              l&apos;environnement de travail de nos clients.
            </li>
            <li className="list-disc md:ml-10">
              <strong>Expertise 360°</strong> : Que vous soyez expert en{" "}
              <strong>Hard FM</strong> (Maintenance, Énergie, CVC) ou en{" "}
              <strong>Soft FM</strong> (Services, Accueil, Propreté), vous
              trouverez chez fm4all des opportunités de développer une expertise
              intégrée et transversale.
            </li>
            <li className="list-disc md:ml-10">
              <strong>Innovation et Digitalisation</strong> : Le FM évolue. Nous
              investissons constamment dans les outils digitaux et les solutions
              connectées pour offrir à nos équipes les meilleurs moyens de
              piloter la performance.
            </li>
            <li className="list-disc md:ml-10">
              <strong>Développement de carrière</strong> : En croissance
              constante, fm4all offre de réelles perspectives d&apos;évolution,
              que ce soit vers des postes de management, de direction de contrat
              ou de l&apos;expertise technique.
            </li>
          </ul>

          <div className="flex flex-col gap-6">
            <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
              Nos métiers, vos talents
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Nous recrutons des profils variés, du terrain au siège, qui
              partagent notre engagement pour l&apos;excellence et le service.
            </p>
            <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
              <li className="list-disc md:ml-10">
                <strong>
                  Gestion de Contrats & Management multi sites / hors site
                </strong>{" "}
                : Responable de contrat, responsable de site FM, chef de projet.
              </li>
              <li className="list-disc md:ml-10">
                <strong>
                  Office Management et gestion de contrat sur site client
                </strong>{" "}
                : Office Manager, Hospitality Manager, Facility Manager,
                Assistant(e) de direction, … de temps plein à temps partiel, en
                passant par le freelance
              </li>
              <li className="list-disc md:ml-10">
                <strong>Fonctions Support</strong> : Support service client,
                commercial B2B, …
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
              Notre promesse candidat
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Nous vous offrons un environnement de travail stimulant, une
              équipe soudée, et les moyens d&apos;exprimer pleinement votre
              potentiel. Chez fm4all, nous ne gérons pas seulement des
              bâtiments, nous gérons des expériences.
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              {" "}
              Prêt à être l&apos;architecte de l&apos;expérience client et
              collaborateur de demain ?
            </p>
          </div>

          <div className="mb-10 flex flex-col gap-6">
            <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
              Candidature spontanée
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Votre profil est rare et précieux ? Nous sommes toujours à
              l&apos;affût de talents exceptionnels. Envoyez-nous votre
              candidature spontanée et discutons de nos futurs projets communs !
            </p>
            <CTAContactButtonsNoConversion
              withVisio={false}
              withPhone={false}
              orientation="horizontal"
              email="emploi@fm4all.com"
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
              Nos valeurs : Le code de conduite de l&apos;innovation FM
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Notre plateforme est alimentée par la technologie, mais notre
              succès repose sur des valeurs humaines et une culture
              d&apos;entreprise forte. Ces principes guident nos équipes, nos
              relations clients et nos partenariats avec les prestataires.
            </p>
            <p className="text-center font-bold">
              La sécurité (digitale et physique)
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              La sécurité est notre fondation, qu&apos;il s&apos;agisse de
              protéger les occupants sur site ou les données de nos clients.
              Nous nous engageons à garantir un environnement de travail
              sécurisé sur le terrain et la{" "}
              <strong>protection maximale de toutes les informations </strong>
              transitant par notre plateforme.
            </p>
            <p className="text-center font-bold">Intégrité et transparence</p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Dans un marché souvent opaque, nous travaillons avec une{" "}
              <strong>clarté absolue</strong>. Notre intégrité se traduit par la{" "}
              <strong>transparence de nos outils</strong> : des devis
              comparables, des contrats clairs et des engagements financiers
              sans surprise. Zéro zone d&apos;ombre.
            </p>
            <p className="text-center font-bold">
              Engagement envers l&apos;excellence opérationnelle
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Nous visons l&apos;excellence grâce à la rigueur de nos processus
              et à la <strong>précision de nos algorithmes</strong>. C&apos;est
              notre passion pour le service, boostée par la technologie, qui
              nous permet de toujours garantir la meilleure performance FM.
            </p>
            <p className="text-center font-bold">
              Esprit d&apos;équipe et synergie digitale
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Nous sommes un <strong>écosystème unifié</strong>. L&apos;entraide
              est notre quotidien, non seulement au sein de nos équipes, mais
              aussi entre notre plateforme et nos partenaires. Ensemble (client,
              fm4all et prestataires), nous allons toujours plus loin.
            </p>
            <p className="text-center font-bold">Innovation continue</p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Notre raison d&apos;être est de bousculer les codes. Nous
              encourageons activement les <strong>idées neuves</strong> qui
              simplifient la vie de nos clients. L&apos;innovation est notre
              moteur pour développer les solutions digitales qui feront la
              différence sur le marché du FM de demain.
            </p>
            <p className="text-center font-bold">
              Respect, diversité et valorisation du talent
            </p>
            <p className="mx-auto max-w-prose text-wrap hyphens-auto">
              Chaque profil compte, qu&apos;il soit sur le terrain ou derrière
              un écran. Nous valorisons la diversité des parcours, car
              c&apos;est la variété des expertises qui alimente notre
              plateforme. Votre talent et votre contribution méritent une
              reconnaissance et une
              <strong>
                valorisation financière à la hauteur de votre impact
              </strong>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="mx-auto flex max-w-prose flex-col items-center gap-6 text-center text-wrap hyphens-auto">
            <p>
              {t(
                "vous-cherchez-a-rejoindre-une-equipe-dynamique-et-engagee-dans-la-transformation-du-facility-management",
              )}
            </p>
            <p>{t("ecrivez-nous")}</p>
          </div>

          <CTAContactButtonsNoConversion
            withVisio={false}
            withPhone={false}
            orientation="horizontal"
            email="emploi@fm4all.com"
          />
        </div>
      </article>
    </main>
  );
};

export default page;
