"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { inviterClientAdminAction } from "@/server/actions/clientServiceExecutionsActions";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type InviterClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestataireEntrepriseId: string;
  clientEntrepriseId: string;
  clientNom: string;
  defaultEmail: string | null;
  onSuccess: () => void;
};

export function InviterClientDialog({
  open,
  onOpenChange,
  prestataireEntrepriseId,
  clientEntrepriseId,
  clientNom,
  defaultEmail,
  onSuccess,
}: InviterClientDialogProps) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const result = await inviterClientAdminAction({
      prestataireEntrepriseId,
      clientEntrepriseId,
      email: email.trim(),
    });
    setSubmitting(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    toast.success("Invitation envoyée avec succès.");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!submitting) {
          setEmail(defaultEmail ?? "");
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Inviter l&apos;administrateur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Envoyer une invitation à <strong>{clientNom}</strong> pour
            qu&apos;ils créent leur compte administrateur sur la plateforme.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="invite-email" className="text-sm">
              Adresse email <span>*</span>
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="invite-email"
                type="email"
                className="pl-8"
                placeholder="contact@entreprise.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !email.trim()}>
              {submitting && <Spinner />}
              Envoyer l&apos;invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
