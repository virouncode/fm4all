type PropositionsFooterProps = {
  serviceId: number;
};

const PropositionsFooter = ({}: PropositionsFooterProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* {comment && <p className="px-2 text-end text-xs italic">{comment}</p>}
      {nextButton && <NextServiceButton handleClickNext={handleClickNext} />} */}
    </div>
  );
};

export default PropositionsFooter;
