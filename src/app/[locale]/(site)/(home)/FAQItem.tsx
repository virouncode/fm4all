import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PropsWithChildren } from "react";

type FAQItemProps = {
  question: string;
  value: string;
  className?: string;
};

const FAQItem = ({
  question,
  value,
  className,
  children,
}: PropsWithChildren<FAQItemProps>) => {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-lg">{question}</AccordionTrigger>
      <AccordionContent className={`flex flex-col gap-4 ${className}`}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FAQItem;
