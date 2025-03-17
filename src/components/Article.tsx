"use client";

import { Button } from "@/components/ui/button";
import { LangContext } from "@/context/LangProvider";
import { client } from "@/sanity/client";
import { ArticleType } from "@/sanity/sanity.types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
const { projectId, dataset } = client.config();

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

type ArticleProps = {
  translations: ArticleType[];
};

const Article = ({ translations }: ArticleProps) => {
  const { lang } = useContext(LangContext);
  const [article, setArticle] = useState<ArticleType>();

  useEffect(() => {
    if (!translations) return;
    setArticle(
      translations.find((translation) => translation.language === lang)
    );
  }, [lang, translations]);

  const articleImageUrl = article?.image
    ? urlFor(article?.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      {article ? (
        <article className="mt-6 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl">{article.title}</h1>
            <Button
              variant="outline"
              className="flex items-center justify-center text-base"
              asChild
              size="lg"
            >
              <Link href="/articles">Revenir aux articles</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
            {articleImageUrl && (
              <Image
                src={articleImageUrl}
                alt={article?.title || ""}
                className="aspect-video rounded-xl"
                width="550"
                height="310"
              />
            )}
            {Array.isArray(article.body) && (
              <PortableText value={article.body} />
            )}
          </div>
        </article>
      ) : null}
    </main>
  );
};

export default Article;
