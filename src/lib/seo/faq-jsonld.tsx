import { PortableTextBlock } from "next-sanity";

export type FaqItemType = {
  question: string;
  answerBlocks: PortableTextBlock[];
};

export type FaqPlainItemType = {
  question: string;
  answer: string;
};

type SanityFaqBlock = {
  _type: "block";
  _key: string;
  style?: string;
  listItem?: "bullet" | "number";
  children?: Array<{ text?: string; _type: "span"; _key: string }>;
};

export function extractFaqItemsFromPortableText(
  faq: SanityFaqBlock[],
): FaqItemType[] {
  const items: FaqItemType[] = [];
  let currentQuestion = "";
  let currentAnswerBlocks: PortableTextBlock[] = [];

  for (const block of faq) {
    if (block.style === "h3") {
      if (currentQuestion && currentAnswerBlocks.length > 0) {
        items.push({
          question: currentQuestion,
          answerBlocks: currentAnswerBlocks,
        });
        currentAnswerBlocks = [];
      }
      currentQuestion = block.children?.map((c) => c.text ?? "").join("") ?? "";
    } else if (currentQuestion) {
      currentAnswerBlocks.push(block as unknown as PortableTextBlock);
    }
  }

  if (currentQuestion && currentAnswerBlocks.length > 0) {
    items.push({
      question: currentQuestion,
      answerBlocks: currentAnswerBlocks,
    });
  }

  return items;
}

export function portableTextBlocksToPlainText(
  blocks: PortableTextBlock[],
): string {
  return blocks
    .map((block) => {
      const b = block as unknown as SanityFaqBlock;
      if (b._type !== "block" || !b.children) return "";
      const text = b.children.map((c) => c.text ?? "").join("");
      return b.listItem ? `• ${text}` : text;
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function escapeForJsonLdScript(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

type FaqJsonLdProps = {
  items: FaqPlainItemType[];
};

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: escapeForJsonLdScript(JSON.stringify(jsonLd)),
      }}
    />
  );
}
