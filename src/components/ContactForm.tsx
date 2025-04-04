"use client";

import { Button } from "@/components/ui/button";

const ContactForm = () => {
  return (
    <div className="text-center">
      <Button
        type="submit"
        title="Rejoindre la liste d'attente"
        variant="destructive"
        size="lg"
        className="w-full md:w-auto text-base"
        onClick={() => {
          window.open("mailto:contact@fm4all.com");
        }}
      >
        Rejoindre la liste d&apos;attente
      </Button>
    </div>
  );
};

export default ContactForm;
