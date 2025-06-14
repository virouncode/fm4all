import { Accordion } from "@/components/ui/accordion";
import { LocaleType } from "@/i18n/routing";
import { PortableText, PortableTextBlock } from "next-sanity";
import FAQItem from "../../(home)/FAQItem";
import { Service } from "../../../../../../sanity.types";

interface FAQServiceProps {
  service: Service;
  locale: LocaleType;
}

const FAQService = ({ service, locale }: FAQServiceProps) => {
  // Vérifier si le service a un champ FAQ et s'il contient des données
  if (!service.faq || !Array.isArray(service.faq) || service.faq.length === 0) {
    return null;
  }

  // Analyser le contenu de service.faq pour extraire les questions et réponses
  // Nous supposons que les questions sont des titres H3 et les réponses sont les paragraphes qui suivent
  const faqItems: {
    id: number;
    question: string;
    answer: PortableTextBlock[];
  }[] = [];
  let currentQuestion = "";
  let currentAnswerBlocks: PortableTextBlock[] = [];
  let id = 0;

  service.faq.forEach((block) => {
    // Si c'est un titre H3, c'est une question
    if (block.style === "h3") {
      // Si nous avons déjà une question et une réponse, ajoutons-les à notre tableau
      if (currentQuestion && currentAnswerBlocks.length > 0) {
        faqItems.push({
          id: id++,
          question: currentQuestion,
          answer: currentAnswerBlocks,
        });
        currentAnswerBlocks = [];
      }
      // Définir la nouvelle question
      currentQuestion =
        block.children?.map((child) => child.text).join("") || "";
    }
    // Sinon, c'est une partie de la réponse
    else if (currentQuestion) {
      currentAnswerBlocks.push(block as PortableTextBlock);
    }
  });

  // Ajouter le dernier élément s'il existe
  if (currentQuestion && currentAnswerBlocks.length > 0) {
    faqItems.push({
      id: id,
      question: currentQuestion,
      answer: currentAnswerBlocks,
    });
  }

  // Si nous n'avons pas pu extraire de questions/réponses, ne rien afficher
  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 flex flex-col ">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4 mb-10">
        {locale === "fr"
          ? "Questions fréquemment posées"
          : "Frequently Asked Questions"}{" "}
        - {service.linkText}
      </h2>

      <Accordion type="single" collapsible className="w-full lg:w-1/2 px-6">
        {faqItems.map((faq) => (
          <FAQItem
            key={faq.id}
            value={`item-${faq.id}`}
            question={faq.question}
          >
            <div
              className="flex-1 prose-lg
        prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl
        prose-h3:font-bold prose-h3:text-xl prose-h3:ml-10 prose-h3:italic
        prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
        prose-p:text-base prose-p:max-w-prose prose-p:mx-auto prose-p:text-pretty prose-p:hyphens-auto
        prose-ul:max-w-prose prose-ul:mx-auto prose-ul:text-base
        prose-li:list-disc prose-li:m-0
        prose-a:underline
        "
            >
              <PortableText value={faq.answer} />
            </div>
          </FAQItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQService;
