import NextServiceButton from "./NextServiceButton";
import PropositionsComment from "./PropositionsComment";

type PropositionsFooterProps = {
  comment?: string;
  handleClickNext: () => void;
  nextButton?: boolean;
};

const PropositionsFooter = ({
  comment,
  handleClickNext,
  nextButton = true,
}: PropositionsFooterProps) => {
  return (
    <>
      {comment && <PropositionsComment text={comment} />}
      {nextButton && <NextServiceButton handleClickNext={handleClickNext} />}
    </>
  );
};

export default PropositionsFooter;
