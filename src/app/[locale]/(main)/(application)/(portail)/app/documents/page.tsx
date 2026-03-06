import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <FileText className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Documents</h1>
      </div>
      <div className="flex-1 overflow-hidden"></div>
    </div>
  );
}
