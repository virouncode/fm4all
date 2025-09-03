type PropositionsCommentProps = {
  text: string;
};

const PropositionsComment = ({ text }: PropositionsCommentProps) => {
  return <p className="px-1 text-end text-sm italic">{text}</p>;
};

export default PropositionsComment;
