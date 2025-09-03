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
        <p className="cursor-pointer text-right text-base font-bold underline md:text-lg">
          Cahier des charges
        </p>
      </DialogTrigger>
      <DialogContent className="max-h-[95%] w-full max-w-none overflow-y-auto rounded-xl md:max-w-[95%]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CDCDialog;
