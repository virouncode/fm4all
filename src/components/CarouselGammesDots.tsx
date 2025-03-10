type CarouselGammesDotsProps = {
  currentIndex: number;
};

const CarouselGammesDots = ({ currentIndex }: CarouselGammesDotsProps) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
      {[...Array(3)].map((_, index) => {
        return (
          <div
            key={index}
            className={`w-3 h-3 rounded-full border-white border ${
              currentIndex === index ? "bg-fm4allsecondary" : "bg-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
};

export default CarouselGammesDots;
