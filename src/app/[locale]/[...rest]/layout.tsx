import Header from "@/components/header/header";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Didact_Gothic } from "next/font/google";
import "../globals.css";

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function CatchAllLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = await getMessages();
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${didact.className} antialiased scroll-smooth`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
