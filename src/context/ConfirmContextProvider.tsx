"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
        <AlertDialogContent className="gap-0 overflow-hidden p-0 max-w-md">
          <div className="bg-primary/8 border-b px-5 pb-4 pt-5 pr-12">
            <AlertDialogHeader>
              <AlertDialogTitle>{opts.title ?? "Are you sure?"}</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          {opts.description ? (
            <div className="px-5 py-4 text-sm">
              {opts.description}
            </div>
          ) : null}
          <AlertDialogFooter className="bg-muted/30 border-t px-5 py-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="min-w-24"
            >
              {opts.cancelText ?? "Cancel"}
            </Button>
            <Button
              className={cn(
                buttonVariants({
                  variant: opts.danger ? "destructive" : "default",
                }),
                "min-w-24",
              )}
              onClick={() => handleClose(true)}
            >
              {opts.confirmText ?? "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
