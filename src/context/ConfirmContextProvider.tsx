"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { ConfirmContext, type ConfirmOptions } from "./ConfirmContext";

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const resolverRef = useRef<(val: boolean) => void>(() => {});

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={(o) => !o && handleClose(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{opts.title ?? "Are you sure?"}</AlertDialogTitle>
            {opts.description ? (
              <AlertDialogDescription>
                {opts.description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleClose(false)}
              className="min-w-24"
            >
              {opts.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                buttonVariants({
                  variant: opts.danger ? "destructive" : "default",
                }),
                "min-w-24",
              )}
              onClick={() => handleClose(true)}
            >
              {opts.confirmText ?? "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
