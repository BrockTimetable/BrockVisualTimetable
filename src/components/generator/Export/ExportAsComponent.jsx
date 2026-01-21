import { ChevronDown, FileImage, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ExportAsPNG } from "@/lib/generator/Export/ExportAsPNG";
import { ExportAsPDF } from "@/lib/generator/Export/ExportAsPDF";
import { ExportAsExcel } from "@/lib/generator/Export/ExportAsExcel";

export default function ExportAsComponent() {
  const handlePNG = () => {
    ExportAsPNG();
    console.log("PNG");
  };

  const handlePDF = () => {
    console.log("PDF");
  };

  const handleExcel = () => {
    console.log("Excel");
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Export As
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handlePNG}>
            <FileImage className="mr-2 h-4 w-4" />
            PNG
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handlePDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExcel}>
            <Table className="mr-2 h-4 w-4" />
            Excel Sheet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
