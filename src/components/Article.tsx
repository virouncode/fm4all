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

    const selectedArticle = translations.find(
      (translation) => translation.language === lang
    );
    console.log(selectedArticle?.slug);

    setArticle(selectedArticle);

    if (selectedArticle) {
      const newUrl = `${selectedArticle?.parentSlug ? `/${selectedArticle.parentSlug}` : ""}/${selectedArticle.slug?.current}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [lang, translations]);

  const articleImageUrl = article?.image ? urlFor(article?.image)?.url() : null;

  console.log(article);

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      {article ? (
        <article className="mt-6 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <h1 className="text-3xl md:text-4xl">{article.title}</h1>
            <Button
              variant="outline"
              className="flex items-center justify-center text-base"
              asChild
              size="lg"
            >
              <Link href="/articles">
                {lang === "en" ? "Back to posts" : "Revenir aux articles"}
              </Link>
            </Button>
          </div>
          {article.subtitle && (
            <h2 className="text-lg font-bold max-w-prose mx-auto">
              {article.subtitle}
            </h2>
          )}
          {articleImageUrl && (
            <div className="h-[200px] lg:h-[400px] md:w-3/4 w-full relative rounded-xl overflow-hidden mx-auto">
              <Image
                src={articleImageUrl}
                alt={article?.title || ""}
                fill={true}
                quality={100}
                className="object-cover object-center"
              />
            </div>
          )}
          <div className="flex flex-col gap-4 mx-auto w-full hyphens-auto text-wrap text-lg prose prose-p:py-0 prose-p:my-0 prose-ul:py-0 prose-ul:my-0 prose-h2:border-l-2 prose-h2:px-4 prose-h2::text-2xl prose-h2::md:text-3xl prose-h2::mb-4 prose-h2::ml-6">
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
