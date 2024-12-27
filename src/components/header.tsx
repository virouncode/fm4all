import { Button } from "@/components/ui/button";
import { CircleUser, HandPlatter, Home, Menu, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full sticky top-0 h-16 bg-background z-20 shadow">
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
          <nav className="hidden md:flex items-center gap-4">
            <div className="hidden lg:flex gap-1 items-center">
              <Home size={15} />
              <Link href="/">Home</Link>
            </div>
            <div className="flex gap-1 items-center">
              <HandPlatter size={15} />
              <Link href="/nos-services">Nos services</Link>
            </div>
            <div className="flex gap-1 items-center">
              <Star size={15} />
              <Link href="/nos-3-gammes">Nos 3 gammes</Link>
            </div>
            <div className="flex gap-1 items-center">
              <CircleUser size={15} />
              <Link href="/hof-managers">HOF Managers</Link>
            </div>
          </nav>
        </div>
        <div className="hidden md:block">
          <Button title="Devenir prestataire" variant="outline">
            <Link href="/devenir-prestataire">Devenir prestataire</Link>
          </Button>
        </div>
        <Menu size={30} className="block md:hidden" />
      </header>
    </div>
  );
};

export default Header;
