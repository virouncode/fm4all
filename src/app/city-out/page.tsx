import CityOut from "./CityOut";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { destination } = await searchParams;

  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <CityOut destination={destination} />
    </main>
  );
};

export default page;
