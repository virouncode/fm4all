import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-fm4allsecondary">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">fm4all</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/" className="hover:opacity-80">
                  Page d&apos;accueil
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-80">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:opacity-80">
                  Mentions legales
                </Link>
              </li>
              <li>Touts droits résérvés &copy;fm4all</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">Services</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/services/nettoyage" className="hover:opacity-80">
                  Nettoyage
                </Link>
              </li>
              <li>
                <Link href="/services/hygiene" className="hover:opacity-80">
                  Hygiene sanitaire
                </Link>
              </li>
              <li>
                <Link href="/services/maintenance" className="hover:opacity-80">
                  Maintenance
                </Link>
              </li>
              <li>
                <Link
                  href="/services/securite-incendie"
                  className="hover:opacity-80"
                >
                  Securité incendie
                </Link>
              </li>
              <li>
                <Link href="/services/cafe" className="hover:opacity-80">
                  Café et boissons chaudes
                </Link>
              </li>
              <li>
                <Link href="/services/snack" className="hover:opacity-80">
                  Snacks et fruits
                </Link>
              </li>
              <li>
                <Link href="/services/eau" className="hover:opacity-80">
                  Fontaines à eau
                </Link>
              </li>
              <li>
                <Link
                  href="/services/office-manager"
                  className="hover:opacity-80"
                >
                  Office manager
                </Link>
              </li>
              <li>
                <Link href="/services/fm4all" className="hover:opacity-80">
                  Pilotage fm4all
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
            <p className="text-secondary text-xl">Prestataires</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/devenir-prestataire" className="hover:opacity-80">
                  Devenir prestataire
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
