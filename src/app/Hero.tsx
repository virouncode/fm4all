import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className="flex items-center justify-center h-[calc(100vh-4rem)] bg-hero-img bg-cover bg-no-repeat"
      id="hero"
    >
      <Card className="w-3/4 md:max-w-2xl p-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl md:text-4xl text-center  text-fm4allsecondary text-pretty">
              Facility Management For All
            </h1>
          </CardTitle>
          <CardDescription>
            <h2 className="text-lg md:text-xl text-center">
              <em>Trouvez des prestataires de services au meilleur prix.</em>
            </h2>
            <p className="flex md:flex-row flex-col items-center text-xl md:text-2xl mt-6 md:justify-center">
              <span>Simplifiez.</span>
              <span>Comparez.</span>
              <span>Déléguez.</span>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 hidden text-lg md:block text-center">
            Le Facility Management pour tous !
          </p>

          <div className="w-full flex justify-center">
            <Button
              title="Mon devis en ligne"
              variant="destructive"
              size="lg"
              className="w-full md:w-auto text-base"
            >
              <Link href="/mon-devis/mes-locaux">
                Je réalise mon devis en ligne
              </Link>
              {/* Mon devis en ligne */}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Hero;
