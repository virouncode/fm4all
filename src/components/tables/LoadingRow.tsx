import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";

type LoadingRowProps = {
  colSpan?: number;
};

const LoadingRow = ({ colSpan }: LoadingRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className="flex items-center gap-2">
          <Spinner />
          Loading...
        </div>
      </TableCell>
    </TableRow>
  );
};

export default LoadingRow;
