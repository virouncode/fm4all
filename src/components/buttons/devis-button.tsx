"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { ReceiptText } from "lucide-react";
import { Dispatch } from "react";
type DevisButtonProps = {
  title: string;
  text: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
  withIcon?: boolean;
  setIsMobileNavOpen?: Dispatch<React.SetStateAction<boolean>>;
};

const DevisButton = ({
  title,
  text,
  size = "default",
  className = "",
  withIcon = false,
  setIsMobileNavOpen,
}: DevisButtonProps) => {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      <Button
        size={size}
        title={title}
        className={`text-base shadow-md transition-all hover:scale-[101%] hover:shadow-lg ${className}`}
        data-testid="devis-button"
        onClick={() => {
          setIsMobileNavOpen?.(false);
          router.push("/devis/locaux");
        }}
      >
        {withIcon && <ReceiptText className="hidden sm:inline" />} {text}
      </Button>
    </div>
  );
};

export default DevisButton;
