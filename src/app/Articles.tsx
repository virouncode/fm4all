import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const Articles = async () => {
  const t = await getScopedI18n("articles");

  const articles = [
    {
      title: t("article1.title"),
      description: t("article1.description"),
      image: "le-fm-c-quoi.webp",
      slug: "article1",
    },
    {
      title: t("article2.title"),
      description: t("article2.description"),
      image: "missions-fm.webp",
      slug: "article2",
    },
    {
      title: t("article3.title"),
      description: t("article3.description"),
      image: "histoire-fm.webp",
      slug: "article3",
    },
    {
      title: t("article4.title"),
      description: t("article4.description"),
      image: "economies.webp",
      slug: "article4",
    },
    {
      title: t("article5.title"),
      description: t("article5.description"),
      image: "histoire-fm.webp",
      slug: "article5",
    },
    {
      title: t("article6.title"),
      description: t("article6.description"),
      image: "histoire-nettoyage.webp",
      slug: "article6",
    },
  ];

  return (
    <section className="max-w-7xl  w-full mx-auto flex flex-col gap-10 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">{t("title")}</h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
          title={t("all_articles")}
          size="lg"
          asChild
        >
          <Link href="/articles">{t("all_articles")}</Link>
        </Button>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {articles.map((article, index) => (
            <CarouselItem
              key={index}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ImgCardVertical
                src={`/img/articles/${article.image}`}
                alt={`illustration-article-${article.title}`}
              >
                <div className="p-4 flex flex-col gap-4 h-52">
                  <p className="text-2xl">{article.title}</p>
                  <p className="w-full overflow-hidden text-ellipsis">
                    {article.description}
                  </p>
                  <div className="flex-1">
                    <Link
                      className="underline"
                      href={`/articles/${article.slug}`}
                    >
                      {t("read_article")}
                    </Link>
                  </div>
                </div>
              </ImgCardVertical>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
        <CarouselNext className="right-0 -top-9 translate-y-0" />
      </Carousel>
      <Link
        href="/articles"
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        {t("view_all_articles")}
      </Link>
    </section>
  );
};

export default Articles;
