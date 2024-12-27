import Footer from "@/components/footer";
import Header from "@/components/header";
import type { Metadata } from "next";
import { Didact_Gothic } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const didact = Didact_Gothic({
  // variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    template: "%s | fm4all",
    default: "Home | fm4all",
  },
  description:
    "Office Management, nettoyage, maintenance règlementaire, machine à café, ... fm4all démocratise le Facility Management pour toutes les tailles d'entreprises. En quelques clics, validez les prestations qui vous conviennent. Cahier des charges, contrats, planification, démarrage, fm4all vous offre un service FM clé en main.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${didact.className} antialiased scroll-smooth`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
