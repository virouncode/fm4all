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

const Services = async () => {
  const t = await getScopedI18n("services");

  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">{t("title")}</h2>
        <Button
          variant="outline"
          className="hidden md:flex text-base justify-center items-center"
          title={t("all_services")}
          size="lg"
          asChild
        >
          <Link href="/nos-services">{t("all_services")}</Link>
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
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/nettoyage.webp"
              alt="illustration-nettoyage"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("cleaning.title")}</p>
                <p className="w-full overflow-hidden text-ellipsis">
                  {t("cleaning.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/nettoyage">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/hygiene.webp"
              alt="illustration-hygiene-sanitaire"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("hygiene.title")}</p>
                <p className="w-full overflow-hidden text-ellipsis">
                  {t("hygiene.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/hygiene">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/maintenance.webp"
              alt="illustration-maintenance"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("maintenance.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("maintenance.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/maintenance">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/incendie.webp"
              alt="illustration-securite-incendie"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("fire_safety.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("fire_safety.description")}
                </p>
                <div className="flex-1">
                  <Link
                    className="underline"
                    href="/services/securite-incendie"
                  >
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/cafe.webp"
              alt="illustration-cafe"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("coffee.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("coffee.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/cafe">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fruits.webp"
              alt="illustration-fruits"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("fruits.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("fruits.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/snacks.webp"
              alt="illustration-snacks"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("snacks.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("snacks.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/boissons.webp"
              alt="illustration-boissons"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("drinks.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("drinks.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/snack">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fontaines.webp"
              alt="illustration-fontaine-a-eau"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("water_fountains.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("water_fountains.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/eau">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/office-managers-vertical.webp"
              alt="illustration-office-manager"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("office_manager.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("office_manager.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/office-manager">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <ImgCardVertical
              src="/img/services/fm4all.webp"
              alt="illustration-fm4all"
            >
              <div className="p-4 flex flex-col gap-4 h-52">
                <p className="text-2xl">{t("fm4all_management.title")}</p>
                <p className="overflow-hidden text-ellipsis">
                  {t("fm4all_management.description")}
                </p>
                <div className="flex-1">
                  <Link className="underline" href="/services/office-manager">
                    {t("learn_more")}
                  </Link>
                </div>
              </div>
            </ImgCardVertical>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
        <CarouselNext className="right-0 -top-9 translate-y-0" />
      </Carousel>
      <Link
        href="/nos-services"
        className="underline text-fm4allsecondary text-lg md:hidden"
      >
        {t("view_all_services")}
      </Link>
    </section>
  );
};

export default Services;
