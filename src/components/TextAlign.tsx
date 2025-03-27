import { PropsWithChildren } from "react";

type TextAlignProps = {
  value: "left" | "end" | "center";
};

export const TextAlign = ({
  value,
  children,
}: PropsWithChildren<TextAlignProps>) => {
  const alignmentClasses = {
    left: "text-left",
    end: "text-right",
    center: "text-center",
  };

  return (
    <div className={alignmentClasses[value] || "text-left"}>{children}</div>
  );
};

export default TextAlign;
