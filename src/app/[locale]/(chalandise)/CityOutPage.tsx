import CityOut from "./CityOut";

type CityOutPageProps = {
  destination?: string;
};

const CityOutPage = ({ destination }: CityOutPageProps) => {
  return (
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <CityOut destination={destination} />
    </main>
  );
};

export default CityOutPage;
