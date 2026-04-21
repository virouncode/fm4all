import { Accordion } from "@/components/ui/accordion";
import { extractFaqItemsFromPortableText } from "@/lib/seo/faq-jsonld";
import { useLocale } from "next-intl";
import { PortableText } from "next-sanity";
import FAQItem from "../../(home)/FAQItem";
import { Service, ServiceVille } from "../../../../../../../sanity.types";

type FAQServiceProps = {
  service: Service | ServiceVille;
};

const FAQService = ({ service }: FAQServiceProps) => {
  const locale = useLocale();
  if (!service.faq || !Array.isArray(service.faq) || service.faq.length === 0) {
    return null;
  }

  const faqItems = extractFaqItemsFromPortableText(service.faq);
  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 flex flex-col">
      <h2 className="mb-10 border-l-2 px-4 text-2xl md:text-3xl">
        {locale === "fr"
          ? "Questions fréquemment posées"
          : "Frequently Asked Questions"}{" "}
        - {service.linkText}
      </h2>

      <Accordion type="single" collapsible className="w-full px-6 lg:w-1/2">
        {faqItems.map((faq, index) => (
          <FAQItem
            key={index}
            value={`item-${index}`}
            question={faq.question}
          >
            <div className="prose-base prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl prose-h3:ml-10 prose-h3:text-xl prose-h3:font-bold prose-h3:italic prose-h4:mx-auto prose-h4:my-8 prose-h4:text-center prose-p:mx-auto prose-p:max-w-prose prose-p:hyphens-auto prose-p:text-pretty prose-p:text-base prose-a:underline prose-ul:mx-auto prose-ul:max-w-prose prose-ul:text-base prose-li:m-0 prose-li:list-disc flex-1">
              <PortableText value={faq.answerBlocks} />
            </div>
          </FAQItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQService;
