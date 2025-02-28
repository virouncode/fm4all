import { Star } from "lucide-react";

type StarRatingProps = {
  score: number;
};

const StarRating = ({ score }: StarRatingProps) => {
  const fullStars = Math.floor(score);
  const hasHalfStar = score - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex space-x-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} fill="#fabc05" stroke="#fabc05" size={12} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star fill="gray" stroke="gray" size={12} />
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <Star fill="#fabc05" stroke="#fabc05" size={12} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="gray" stroke="gray" size={12} />
      ))}
    </div>
  );
};

export default StarRating;
