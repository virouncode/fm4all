import { BookOpen } from "lucide-react";
import { Suspense } from "react";
import { DocumentsClient } from "./DocumentsClient";

type SearchParamsType = {
  tab?: string;
  search?: string;
  visibilite?: string;
  tagIds?: string; // comma-separated UUIDs
  partenaireEntrepriseId?: string;
  orderBy?: string;
  orderDir?: string;
};

type DocumentsPageProps = {
  searchParams: Promise<SearchParamsType>;
};

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <BookOpen className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Documents</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement...</div>}>
          <DocumentsClient searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
