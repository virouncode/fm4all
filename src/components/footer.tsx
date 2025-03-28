import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  return (
    <footer className="bg-fm4allsecondary">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">fm4all</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/" className="hover:opacity-80">
                  {t("page-d-accueil")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-80">
                  {t("nous-contacter")}
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:opacity-80">
                  {t("mentions-legales")}
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className="hover:opacity-80"
                >
                  {t("politique-de-confidentialite")}
                </Link>
              </li>
              <li>
                <Link href="/politique-de-cookies" className="hover:opacity-80">
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
              <li>
                <Link href="/services/nettoyage" className="hover:opacity-80">
                  {t("nettoyage")}
                </Link>
              </li>
              <li>
                <Link href="/services/hygiene" className="hover:opacity-80">
                  {t("hygiene-sanitaire")}
                </Link>
              </li>
              <li>
                <Link href="/services/maintenance" className="hover:opacity-80">
                  {t("maintenance")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/securite-incendie"
                  className="hover:opacity-80"
                >
                  {t("securite-incendie")}
                </Link>
              </li>
              <li>
                <Link href="/services/cafe" className="hover:opacity-80">
                  {t("cafe-et-boissons-chaudes")}
                </Link>
              </li>
              <li>
                <Link href="/services/snack" className="hover:opacity-80">
                  {t("snacks-et-fruits")}
                </Link>
              </li>
              <li>
                <Link href="/services/eau" className="hover:opacity-80">
                  {t("fontaines-a-eau")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/office-manager"
                  className="hover:opacity-80"
                >
                  {t("office-manager")}
                </Link>
              </li>
              <li>
                <Link href="/services/fm4all" className="hover:opacity-80">
                  {t("pilotage-fm4all")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">Articles</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link
                  href="/articles/le-fm-cest-quoi"
                  className="hover:opacity-80"
                >
                  Le FM c&apos;est quoi ?
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/missions-du-fm"
                  className="hover:opacity-80"
                >
                  Les missions du FM
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/lexternalisation-du-fm"
                  className="hover:opacity-80"
                >
                  Histoire de l&apos;externalisation du FM
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/le-fm-fait-il-faire-des-economies"
                  className="hover:opacity-80"
                >
                  Le FM fait-il faire des économies ?
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/histoire-du-nettoyage"
                  className="hover:opacity-80"
                >
                  Histoire du nettoyage industriel
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/hof-managers"
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
                <Link href="/devenir-prestataire" className="hover:opacity-80">
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
