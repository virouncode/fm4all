import FoodBeverage from "./FoodBeverage";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { surface, effectif } = await searchParams;
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">Food & Beverage</h1>
        <FoodBeverage />
      </div>
    </>
  );
};

export default page;
