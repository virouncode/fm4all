import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { PropsWithChildren } from "react";

type TextColorFm4allProps = {
  value: "essentiel" | "confort" | "excellence";
};

export const TextColorFm4all = ({
  value,
  children,
}: PropsWithChildren<TextColorFm4allProps>) => {
  const color = getFm4AllColor(value);
  const colorClasses = {
    fm4allessential: "text-fm4allessential",
    fm4allcomfort: "text-fm4allcomfort",
    fm4allexcellence: "text-fm4allexcellence",
  };

  return (
    <div className={`${color ? colorClasses[color] : ""} font-bold`}>
      {children}
    </div>
  );
};

export default TextColorFm4all;
