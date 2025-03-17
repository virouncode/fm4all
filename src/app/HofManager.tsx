import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const HofManager = async () => {
  const t = await getScopedI18n("hofManager");

  return (
    <section className="hidden md:block w-full max-w-7xl mx-auto h-[600px] p-6">
      <div className="h-full bg-hof-img bg-cover bg-no-repeat rounded-lg flex items-end">
        <Card className="w-1/3 ml-10 mb-10">
          <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription>
              <h2 className="text-3xl border-l-2 px-4">{t("title")}</h2>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-6">{t("description")}</p>
            <Button
              variant="outline"
              title={t("button")}
              className="flex justify-center items-center text-base"
              size="default"
              asChild
            >
              <Link href="/articles/hof-managers">{t("button")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HofManager;
