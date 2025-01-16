import NextServiceButton from "./NextServiceButton";

type PropositionsFooterProps = {
  handleClickNext: () => void;
  nextButton?: boolean;
};

const PropositionsFooter = ({
  handleClickNext,
  nextButton = true,
}: PropositionsFooterProps) => {
  return (
    <>{nextButton && <NextServiceButton handleClickNext={handleClickNext} />}</>
  );
};

export default PropositionsFooter;
