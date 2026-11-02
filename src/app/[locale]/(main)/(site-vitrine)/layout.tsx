import CookieBanner from "@/components/banners/CookieBanner";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { AlternateSlugsProvider } from "@/context/AlternateSlugsContext";
import { routing } from "@/i18n/routing";

import { localeParams } from "@/i18n/routing";
import { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await localeParams(params);
  const titleTemplate = "%s | fm4all";
  const title =
    locale === "fr"
      ? "Entreprise de facility management à Paris et en IDF - Devis en ligne"
      : "Facility Management Company in Paris & Île-de-France – Instant Quote";
  const description =
    locale === "fr"
      ? "fm4all gère vos services généraux à Paris et en IDF : propreté, maintenance, etc. Obtenez dès maintenant un devis gratuit pour vos locaux."
      : "Facility Management services in Paris: fm4all provides cleaning, maintenance, fire safety, and more. Get your free quote online and simplify operations.";
  return {
    metadataBase: new URL("https://www.fm4all.com"),
    title: {
      template: titleTemplate,
      default: title,
    },
    description: description,
  };
};

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await localeParams(params);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <AlternateSlugsProvider>
      <Header />
      {children}
      <Footer />
      <CookieBanner />
    </AlternateSlugsProvider>
  );
}
