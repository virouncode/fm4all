"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

type BackButtonProps = {
  title: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = ({
  title,
  className,
  variant,
  size,
  ...props
}: BackButtonProps) => {
  const router = useRouter();
  return (
    <Button
      title={title}
      className={className}
      variant={variant}
      size={size}
      {...props}
      onClick={() => router.back()}
    >
      {title}
    </Button>
  );
};

export default BackButton;
