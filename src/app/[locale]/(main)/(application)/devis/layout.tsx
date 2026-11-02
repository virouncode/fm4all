import Header from "@/components/header/header";
import { localeParams } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { DevisStoresProvider } from "@/stores/devis/DevisStoresProvider";

import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function DevisLayout({
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
    <DevisStoresProvider>
      <Header />
      {children}
    </DevisStoresProvider>
  );
}
