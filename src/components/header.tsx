import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full border-b-2 sticky top-0 h-16 bg-background">
      <header className="max-w-7xl h-full flex justify-between items-center p-6 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image
              src="/img/logo-full.png"
              alt="Logo"
              width={100}
              height={23}
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/nos-services">Nos services</Link>
            <Link href="/nos-3-gammes">Nos 3 gammes</Link>
            <Link href="/articles/hof-managers">HOF Managers</Link>
          </nav>
        </div>
        <div>
          <Button title="Devenir prestataire" variant="outline">
            Devenir prestataire
          </Button>
        </div>
      </header>
    </div>
  );
};

export default Header;
