type CarouselGammesDotsProps = {
  currentIndex: number;
};

const CarouselGammesDots = ({ currentIndex }: CarouselGammesDotsProps) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center space-x-2">
      {[...Array(3)].map((_, index) => {
        return (
          <div
            key={index}
            className={`h-3 w-3 rounded-full border border-white ${
              currentIndex === index ? "bg-fm4allsecondary" : "bg-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
};

export default CarouselGammesDots;
