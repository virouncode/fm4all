import { ModeToggle } from "@/components/theme/mode-toggle";

const page = () => {
  return (
    <>
      <div>Light Mode</div>
      <div className="flex flex-wrap text-sm">
        <div className="h- w-32 bg-background font-bold text-yellow-500">
          background
        </div>
        <div className="h-32 w-32 bg-foreground font-bold text-yellow-500">
          foreground
        </div>
        <div className="h-32 w-32 bg-card font-bold text-yellow-500">card</div>
        <div className="h-32 w-32 bg-card-foreground font-bold text-yellow-500">
          card-foreground
        </div>
        <div className="h-32 w-32 bg-popover font-bold text-yellow-500">
          popover
        </div>
        <div className="h-32 w-32 bg-popover-foreground font-bold text-yellow-500">
          popover-foreground
        </div>
        <div className="h-32 w-32 bg-primary font-bold text-yellow-500">
          primary
        </div>
        <div className="h-32 w-32 bg-foreground font-bold text-yellow-500">
          primary-foreground
        </div>
        <div className="h-32 w-32 bg-secondary font-bold text-yellow-500">
          secondary
        </div>
        <div className="h-32 w-32 bg-secondary-foreground font-bold text-yellow-500">
          secondary-foreground
        </div>
        <div className="h-32 w-32 bg-muted font-bold text-yellow-500">
          muted
        </div>
        <div className="h-32 w-32 bg-muted-foreground font-bold text-yellow-500">
          muted-foreground
        </div>
        <div className="h-32 w-32 bg-accent font-bold text-yellow-500">
          accent
        </div>
        <div className="h-32 w-32 bg-accent-foreground font-bold text-yellow-500">
          accent-foreground
        </div>
        <div className="h-32 w-32 bg-destructive font-bold text-yellow-500">
          destructive
        </div>
        <div className="h-32 w-32 bg-destructive-foreground font-bold text-yellow-500">
          destructive-foreground
        </div>
        <div className="h-32 w-32 bg-border font-bold text-yellow-500">
          border
        </div>
        <div className="h-32 w-32 bg-input font-bold text-yellow-500">
          input
        </div>
        <div className="h-32 w-32 bg-ring font-bold text-yellow-500">ring</div>
        <div className="h-32 w-32 bg-chart-1 font-bold text-yellow-500">
          chart-1
        </div>
        <div className="h-32 w-32 bg-chart-2 font-bold text-yellow-500">
          chart-2
        </div>
        <div className="h-32 w-32 bg-chart-3 font-bold text-yellow-500">
          chart-3
        </div>
        <div className="h-32 w-32 bg-chart-4 font-bold text-yellow-500">
          chart-4
        </div>
        <div className="h-32 w-32 bg-chart-5 font-bold text-yellow-500">
          chart-5
        </div>
      </div>
      <ModeToggle />
    </>
  );
};

export default page;
