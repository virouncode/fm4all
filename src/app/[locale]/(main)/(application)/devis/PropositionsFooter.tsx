import { useServicesStore } from "@/stores/servicesStore";
import NextServiceButton from "./NextServiceButton";

type PropositionsFooterProps = {
  service: { id: number; icon: React.ReactNode; title: string };
  comment?: string;
  nextButton?: boolean;
};

const PropositionsFooter = ({
  service,
  comment,
  nextButton = true,
}: PropositionsFooterProps) => {
  const setServices = useServicesStore((s) => s.setServices);
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };
  return (
    <div className="flex flex-col gap-4">
      {comment && <p className="px-2 text-end text-xs italic">{comment}</p>}
      {nextButton && <NextServiceButton handleClickNext={handleClickNext} />}
    </div>
  );
};

export default PropositionsFooter;
