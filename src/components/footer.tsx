import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { SERVICES_QUERY } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { Service } from "../../sanity.types";

const Footer = async () => {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const services = await client.fetch<Service[]>(
    SERVICES_QUERY,
    { language: locale }
    // options
  );
  return (
    <footer className="bg-fm4allsecondary">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">fm4all</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/home" className="hover:opacity-80">
                  {t("page-d-accueil")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-80">
                  {t("nous-contacter")}
                </Link>
              </li>
              <li>
                <Link href="/mentions" className="hover:opacity-80">
                  {t("mentions-legales")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:opacity-80">
                  {t("politique-de-confidentialite")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:opacity-80">
                  {t("politique-de-cookies")}
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:opacity-80">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:opacity-80">
                  CGU
                </Link>
              </li>
              <li>{t("touts-droits-reserves-and-copy-fm4all")}</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">{t("services")}</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              {services.map((service) => {
                const serviceUrl = service.slug?.current ?? "";
                return (
                  <li key={service._id}>
                    <Link
                      href={{
                        pathname: "/services/[slug]",
                        params: { slug: serviceUrl },
                      }}
                      className="hover:opacity-80"
                    >
                      {service.titre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">Articles</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "le-fm-cest-quoi" },
                  }}
                  className="hover:opacity-80"
                >
                  Le FM c&apos;est quoi ?
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "les-missions-du-fm" },
                  }}
                  className="hover:opacity-80"
                >
                  Les missions du FM
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "histoire-de-lexternalisation-du-fm" },
                  }}
                  className="hover:opacity-80"
                >
                  Histoire de l&apos;externalisation du FM
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "le-fm-fait-il-faire-des-economies" },
                  }}
                  className="hover:opacity-80"
                >
                  Le FM fait-il faire des économies ?
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "histoire-du-nettoyage-industriel" },
                  }}
                  className="hover:opacity-80"
                >
                  Histoire du nettoyage industriel
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: "hof-managers" },
                  }}
                  className="hover:opacity-80"
                >
                  Hof Managers
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">{t("prestataires")}</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/prestataire" className="hover:opacity-80">
                  {t("devenir-prestataire")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
