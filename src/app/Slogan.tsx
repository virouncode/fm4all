import Image from "next/image";

const Slogan = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-center lg:gap-10 gap-6 items-center max-w-7xl w-full mx-auto p-6">
      <div className="h-[50px] w-[200px] relative rounded-xl overflow-hidden">
        <Image
          src={"/img/logo_full.webp"}
          alt={"logo-fm4all"}
          fill={true}
          className="object-contain object-center"
        />
      </div>
      <h2 className="text-4xl italic text-center">
        Le Facility Management pour tous
      </h2>
    </div>
  );
};

export default Slogan;
