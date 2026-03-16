"use client";

import { cn } from "@/lib/utils";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import type React from "react";

/**
 * Variantes stylées des composants Dialog.
 * Appliquent le header coloré (bg-primary/8) cohérent sur tous les modules.
 * N'éditent pas dialog.tsx (shadcn).
 */

function DialogStyledContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn("gap-0 overflow-hidden p-0", className)}
      {...props}
    />
  );
}

function DialogStyledHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-primary/8 border-b px-5 pb-4 pt-5 pr-12", className)}
      {...props}
    />
  );
}

function DialogStyledBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

function DialogStyledFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "bg-muted/30 border-t px-5 py-3 sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
};
