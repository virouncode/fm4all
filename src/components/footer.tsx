import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-fm4allsecondary">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-6 lg:w-2/3">
          <div className="flex flex-col gap-2">
            <p className="text-secondary text-xl">fm4all</p>
            <ul>
              <li>
                <Link href="/contact">Nous contacter</Link>
              </li>
              <li>
                <Link href="/mentions-legales">Mentions legales</Link>
              </li>
              <li>Touts droits résérvés &copy;fm4all</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-secondary text-xl">Articles</p>
            <ul>
              <li>
                <Link href="/articles/le-fm-cest-quoi">
                  Le FM c&apos;est quoi ?
                </Link>
              </li>
              <li>
                <Link href="/articles/missions-du-fm">Les missions du FM</Link>
              </li>
              <li>
                <Link href="/articles/lexternalisation-du-fm">
                  Histoire de l&apos;externalisation du FM
                </Link>
              </li>
              <li>
                <Link href="/articles/le-fm-fait-il-faire-des-economies">
                  Le FM fait-il faire des économies ?
                </Link>
              </li>
              <li>
                <Link href="/articles/histoire-du-nettoyage">
                  Histoire du nettoyage industriel
                </Link>
              </li>
              <li>
                <Link href="/articles/hof-managers">Hof Managers</Link>
              </li>
            </ul>
          </div>
          {/* <div className="flex flex-col gap-4 ">
            <p className="text-secondary text-xl">Services</p>
            <ul>
              <li>
                <Link href="/services/nettoyage">Nettoyage</Link>
              </li>
              <li>
                <Link href="/services/cafe">Café</Link>
              </li>
              <li>
                <Link href="/services/eau">Fontaine à eau</Link>
              </li>
              <li>
                <Link href="/services/maintenance">
                  Maintenance règlementaire
                </Link>
              </li>
              <li>
                <Link href="/services/securite-incendie">
                  Sécurité incendie
                </Link>
              </li>
              <li>
                <Link href="/services/office-manager">Office manager</Link>
              </li>
              <li>
                <Link href="/services/accueil">Accueil</Link>
              </li>
              <li>
                <Link href="/services/petits-travaux">Petits travaux</Link>
              </li>
              <li>
                <Link href="/services/snack">Snack & fruits</Link>
              </li>
              <li>
                <Link href="/services/agent-de-securite">
                  Agent de sécurité
                </Link>
              </li>
            </ul>
          </div> */}
          <div className="flex flex-col gap-2">
            <p className="text-secondary text-xl">Prestataires</p>
            <ul>
              <li>
                <Link href="/devenir-prestataire">Devenir prestataire</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
