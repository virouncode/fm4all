"use client";

import { InputWithLabel } from "@/components/formInputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});
type ContactType = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const defaultValues: { email: string } = {
    email: "",
  };

  const form = useForm<ContactType>({
    mode: "onBlur",
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const submitForm = (data: ContactType) => {
    console.log(data);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitForm)}
        className="flex flex-col gap-8 "
      >
        <InputWithLabel<ContactType>
          fieldTitle="Email"
          nameInSchema="email"
          className="text-base py-6 w-full md:max-w-none"
        />
        <div className="text-center">
          <Button
            type="submit"
            title="Rejoindre la liste d'attente"
            variant="outline"
            size="lg"
          >
            Rejoindre la liste d&apos;attente
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
