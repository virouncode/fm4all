import NextServiceButton from "./NextServiceButton";

type PropositionsFooterProps = {
  handleClickNext: () => void;
  nextButton?: boolean;
  comment?: string;
};

const PropositionsFooter = ({
  handleClickNext,
  nextButton = true,
  comment,
}: PropositionsFooterProps) => {
  return (
    <div className="flex flex-col gap-4">
      {comment && <p className="text-xs italic text-end px-2">{comment}</p>}
      {nextButton && <NextServiceButton handleClickNext={handleClickNext} />}
    </div>
  );
};

export default PropositionsFooter;
