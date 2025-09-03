import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type ConceptCardProps = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

const ConceptCard = ({ icon: Icon, title, description }: ConceptCardProps) => {
  return (
    <Card className="w-full p-4 lg:w-1/3">
      <CardHeader>
        <CardTitle className="flex flex-col items-center justify-center gap-4">
          <Icon size={40} />
          <p className="text-center text-2xl">{title}</p>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">{description}</CardContent>
    </Card>
  );
};

export default ConceptCard;
