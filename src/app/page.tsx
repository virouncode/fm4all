import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facility Management à Paris & Île-de-France - Devis en ligne",
  description:
    "fm4all démocratise les services aux entreprises de toutes tailles à Paris & Île-de-France. Comparez les offres de nos prestataires et obtenez un devis en ligne.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fm4all.com/fr",
    languages: {
      en: "https://www.fm4all.com/en",
      fr: "https://www.fm4all.com/fr",
    },
  },
  openGraph: {
    images: [
      {
        url: "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/fm4all_logo/logo_fm4all-npSiw7PiYrpkPsnBLuzDYGVO5rWVZb.png",
        width: 1200,
        height: 630,
        alt: "Facility Management à Paris & Île-de-France - Devis en ligne",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main>
      <h1>Page racine</h1>
      <p>Redirection ou choix de langue ici...</p>
    </main>
  );
}
