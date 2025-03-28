import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

const HofManager = () => {
  return (
    <section className="hidden md:block w-full max-w-7xl mx-auto h-[600px] p-6">
      <div className="h-full bg-hof-img bg-cover bg-no-repeat rounded-lg flex items-end">
        <Card className="w-1/3 ml-10 mb-10">
          <CardHeader>
            <CardTitle>
              <h3 className="text-4xl"></h3>
            </CardTitle>
            <CardDescription>
              <h2 className="text-3xl border-l-2 px-4">HOF Managers</h2>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-6">
              fm4all réinvente le métier d&apos;Office Manager : les HOF
              Manager. Hospitality, Office et Facility Manager, trois métiers
              qui chez fm4all ne font plus qu&apos;un : les HOF Managers.
            </p>
            <Button
              variant="outline"
              title="Decouvrir l'offre"
              className="flex justify-center items-center text-base"
              size="default"
              asChild
            >
              <Link href="/articles/hof-managers">Decouvrir l&apos;offre</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HofManager;
