import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CDCDialogProps = {
  children: React.ReactNode;
};

const CDCDialog = ({ children }: CDCDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="text-base md:text-lg font-bold underline cursor-pointer text-right">
          Cahier des charges
        </p>
      </DialogTrigger>
      <DialogContent className="w-full rounded-xl max-h-[95%] overflow-y-auto md:max-w-[95%] max-w-none">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CDCDialog;
