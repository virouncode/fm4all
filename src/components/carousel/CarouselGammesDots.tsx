type CarouselGammesDotsProps = {
  currentIndex: number;
};

const CarouselGammesDots = ({ currentIndex }: CarouselGammesDotsProps) => {
  return (
    <div className="absolute right-0 bottom-4 left-0 z-10 flex justify-center space-x-2">
      {[...Array(3)].map((_, index) => {
        return (
          <div
            key={index}
            className={`h-3 w-3 rounded-full border border-white ${
              currentIndex === index ? "bg-primary" : "bg-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
};

export default CarouselGammesDots;
