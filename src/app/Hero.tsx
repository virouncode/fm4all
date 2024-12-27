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
      <Card className="w-3/4 md:w-1/2 py-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl text-center md:text-4xl ">
              Facility Management For All
            </h1>
          </CardTitle>
          <CardDescription>
            <h2 className="text-xl text-center lg:text-3xl">
              <em>Trouvez vos futurs prestataires en ligne.</em>
            </h2>
            <p className="flex flex-col items-center md:flex-row text-xl lg:text-3xl mt-4 md:justify-center">
              <span>Cherchez.</span>
              <span>Comparez.</span>
              <span>Déléguez.</span>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 hidden text-lg md:block">
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
