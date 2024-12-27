import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "./ContactForm";

const Hero = () => {
  return (
    <section
      className="flex items-center justify-center h-[calc(100vh-4rem)] bg-hero-img bg-cover bg-no-repeat"
      id="hero"
    >
      <Card className="w-1/2 py-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-4xl">Facility Managment 4 All</h1>
          </CardTitle>
          <CardDescription>
            <h2 className="text-3xl">
              Trouvez vos futurs prestataires en ligne
            </h2>
            <p className="text-3xl">Cherchez.Comparez.Déléguez.</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-lg">
            Nous peaufinons encore les derniers détails. Rejoignez notre liste
            d&apos;attente afin d&apos;être les premiers informés du lancement
            officiel.
          </p>
          <ContactForm />
        </CardContent>
      </Card>
    </section>
  );
};

export default Hero;
