import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
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
