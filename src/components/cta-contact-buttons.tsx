import Link from "next/link";
import { Button } from "./ui/button";

const CTAContactButtons = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
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
          Je prends un rendez-vous en visio
        </Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="tel:+33669311046">Je contacte par téléphone</Link>
      </Button>
      <Button
        variant="destructive"
        size="lg"
        className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
        asChild
      >
        <Link href="mailto:contact@fm4all.com">Je contacte par e-mail</Link>
      </Button>
    </div>
  );
};

export default CTAContactButtons;
