type PropositionsCommentProps = {
  text: string;
};

const PropositionsComment = ({ text }: PropositionsCommentProps) => {
  return <p className="text-sm italic text-end px-1">{text}</p>;
};

export default PropositionsComment;
