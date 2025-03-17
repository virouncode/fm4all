import Article from "@/components/Article";
import { client } from "@/sanity/client";
import { ARTICLE_TRANSLATIONS_QUERY } from "@/sanity/lib/queries";
import { ArticleType } from "@/sanity/sanity.types";

import { type SanityDocument } from "next-sanity";

const options = { next: { revalidate: 30 } };

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const results = await client.fetch<SanityDocument>(
    ARTICLE_TRANSLATIONS_QUERY,
    await params,
    options
  );

  const articleTranslations: ArticleType[] = results[0]._translations;

  return <Article translations={articleTranslations} />;
}
