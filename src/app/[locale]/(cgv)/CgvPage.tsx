import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const CgvPage = async () => {
  const t = await getScopedI18n("cgvPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-4 w-full mx-auto max-w-prose items-center">
          <p>
            {t("document_not_displayed")}{" "}
            <Link
              href="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250303-Tmu6Vmvpwg7boAzkM9dFt3Vyc4Rw3n.pdf"
              target="_blank"
              className="underline"
            >
              {t("click_here")}
            </Link>
          </p>
        </div>
        <div className="w-full mt-6 mb-6">
          <iframe
            src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/cgv/CGV%20fm4all%2020250303-Tmu6Vmvpwg7boAzkM9dFt3Vyc4Rw3n.pdf"
            className="w-full h-screen"
          />
        </div>
      </section>
    </main>
  );
};

export default CgvPage;
