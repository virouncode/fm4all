import { RawSearchParams } from "@/normalize/normalizeSearchParams";
import { getProspects } from "@/server/queries_a_classer/prospects/getProspects";
import { parseProspectsQuery } from "@/zod-schemas/prospect";
import { ClientCreationChoice } from "./ClientCreationChoice";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<RawSearchParams>;
}) => {
  const { userId } = await params;
  const query = parseProspectsQuery(await searchParams);
  const initialData = await getProspects({
    query,
  });
  return (
    <main className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background/95 shrink-0 border-b">
        <h1 className="py-2 text-center text-xl font-bold">Nouveau client</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ClientCreationChoice
          userId={userId}
          initialData={initialData}
          query={query}
        />
      </div>
    </main>
  );
};

export default page;
