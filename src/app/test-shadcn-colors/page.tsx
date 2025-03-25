import { ModeToggle } from "@/components/mode-toggle";

const page = () => {
  return (
    <>
      <div>Light Mode</div>
      <div className="flex flex-wrap text-sm">
        <div className="h- w-32 bg-background text-yellow-500 font-bold">
          background
        </div>
        <div className="h-32 w-32 bg-foreground text-yellow-500 font-bold">
          foreground
        </div>
        <div className="h-32 w-32 bg-card text-yellow-500 font-bold">card</div>
        <div className="h-32 w-32 bg-card-foreground text-yellow-500 font-bold">
          card-foreground
        </div>
        <div className="h-32 w-32 bg-popover text-yellow-500 font-bold">
          popover
        </div>
        <div className="h-32 w-32 bg-popover-foreground text-yellow-500 font-bold">
          popover-foreground
        </div>
        <div className="h-32 w-32 bg-primary text-yellow-500 font-bold">
          primary
        </div>
        <div className="h-32 w-32 bg-foreground text-yellow-500 font-bold">
          primary-foreground
        </div>
        <div className="h-32 w-32 bg-secondary text-yellow-500 font-bold">
          secondary
        </div>
        <div className="h-32 w-32 bg-secondary-foreground text-yellow-500 font-bold">
          secondary-foreground
        </div>
        <div className="h-32 w-32 bg-muted text-yellow-500 font-bold">
          muted
        </div>
        <div className="h-32 w-32 bg-muted-foreground text-yellow-500 font-bold">
          muted-foreground
        </div>
        <div className="h-32 w-32 bg-accent text-yellow-500 font-bold">
          accent
        </div>
        <div className="h-32 w-32 bg-accent-foreground text-yellow-500 font-bold">
          accent-foreground
        </div>
        <div className="h-32 w-32 bg-destructive text-yellow-500 font-bold">
          destructive
        </div>
        <div className="h-32 w-32 bg-destructive-foreground text-yellow-500 font-bold">
          destructive-foreground
        </div>
        <div className="h-32 w-32 bg-border text-yellow-500 font-bold">
          border
        </div>
        <div className="h-32 w-32 bg-input text-yellow-500 font-bold">
          input
        </div>
        <div className="h-32 w-32 bg-ring text-yellow-500 font-bold">ring</div>
        <div className="h-32 w-32 bg-chart-1 text-yellow-500 font-bold">
          chart-1
        </div>
        <div className="h-32 w-32 bg-chart-2 text-yellow-500 font-bold">
          chart-2
        </div>
        <div className="h-32 w-32 bg-chart-3 text-yellow-500 font-bold">
          chart-3
        </div>
        <div className="h-32 w-32 bg-chart-4 text-yellow-500 font-bold">
          chart-4
        </div>
        <div className="h-32 w-32 bg-chart-5 text-yellow-500 font-bold">
          chart-5
        </div>
      </div>
      <ModeToggle />
    </>
  );
};

export default page;
