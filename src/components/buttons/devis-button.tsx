"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
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
  return (
    <Link href="/devis/locaux">
      <Button
        variant="destructive"
        size={size}
        title={title}
        className={`ring-destructive text-base shadow-md ring-2 ring-offset-2 transition-all hover:scale-[101%] hover:shadow-lg ${className}`}
        data-testid="devis-button"
        onClick={() => setIsMobileNavOpen?.(false)}
      >
        {withIcon && <ReceiptText className="hidden sm:inline" />} {text}
      </Button>
    </Link>
  );
};

export default DevisButton;
