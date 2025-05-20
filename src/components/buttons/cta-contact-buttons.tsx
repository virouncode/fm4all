import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import Link from "next/link";

const CTAContactButtons = () => {
  const locale = useLocale();

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link
          href="https://calendly.com/romuald-fm4all/rdv-fm4all"
          target="_blank"
        >
          {locale === "fr"
            ? "Je prends un rendez-vous en visio"
            : "Schedule a video call"}
        </Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="tel:+33669311046">+33 6 69 31 10 46</Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="mailto:contact@fm4all.com">
          {locale === "fr" ? "Je contact par email" : "Contact by e-mail"}
        </Link>
      </Button>
    </div>
  );
};

export default CTAContactButtons;
