import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-10 bg-cyan-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-10 w-2/3">
          <div className="flex flex-col gap-6 w-1/4">
            <p className="text-slate-200">fm4all</p>
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
          <div className="flex flex-col gap-6 w-1/4">
            <p className="text-slate-200">Facility Managment</p>
            <ul>
              <li>
                <Link href="/contact">Nos 3 gammes</Link>
              </li>
              <li>
                <Link href="/contact">Nos services</Link>
              </li>
              <li>
                <Link href="/contact">Nos engagements</Link>
              </li>
              <li>
                <Link href="/contact">Hof Managers</Link>
              </li>
              <li>
                <Link href="/contact">Le FM c'est quoi ?</Link>
              </li>
              <li>
                <Link href="/contact">Les différentes missions du FM</Link>
              </li>
              <li>
                <Link href="/contact">Le FM fait-il faire des économies ?</Link>
              </li>
              <li>
                <Link href="/contact">Histoire de l'externalisation du FM</Link>
              </li>
              <li>
                <Link href="/contact">Histoire du nettoyage industriel</Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 w-1/4">
            <p className="text-slate-200">Services</p>
            <ul></ul>
          </div>
          <div className="flex flex-col gap-6 w-1/4">
            <p className="text-slate-200">Prestataires</p>
            <ul></ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
