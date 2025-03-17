import Article from "@/components/Article";
import { client } from "@/sanity/client";
import {
  ARTICLE_QUERY,
  ARTICLE_TRANSLATIONS_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/urlFor";
import { ArticleType } from "@/sanity/sanity.types";

import { type SanityDocument } from "next-sanity";
import { Suspense } from "react";

const options = { next: { revalidate: 30 } };

export async function generateStaticParams() {
  return [
    { parentSlug: "facility-management", slug: "le-fm-c-est-quoi" },
    {
      parentSlug: "facility-management",
      slug: "histoire-de-l-externalisation-du-fm",
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // read route params
  const article = await client.fetch<SanityDocument>(
    ARTICLE_QUERY,
    await params,
    options
  );
  return {
    title: article.title,
    description: article.subtitle,
    openGraph: {
      images: [urlFor(article.image)],
    },
  };
}

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
  return (
    <Suspense>
      <Article translations={articleTranslations} />
    </Suspense>
  );
}
