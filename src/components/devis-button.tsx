"use client";
import { Button } from "@/components/ui/button";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import Link from "next/link";
import { useContext } from "react";
import { devisRoutes } from "./devis/DevisBreadcrumb";

type DevisButtonProps = {
  title: string;
  text: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
};

const DevisButton = ({
  title,
  text,
  className,
  size = "default",
}: DevisButtonProps) => {
  const { devisProgress } = useContext(DevisProgressContext);
  const url = devisProgress.currentStep
    ? devisRoutes.find(({ id }) => id === devisProgress.currentStep)?.url ??
      "/mes-locaux"
    : "/mes-locaux";
  return (
    <Button
      title={title}
      variant="destructive"
      size={size}
      className={`w-full md:w-auto text-base ${className}`}
    >
      <Link href={`/mon-devis${url}`}>{text}</Link>
      {/* Mon devis en ligne */}
    </Button>
  );
};

export default DevisButton;
