import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type WhyCardProps = {
  title: string;
  content: string;
  icon: LucideIcon;
};

const WhyCard = ({ title, content, icon: Icon }: WhyCardProps) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <p>{title}</p>
          <Icon size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  );
};

export default WhyCard;
