import { ChevronDown, FileImage, FileText, Table } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

import { ExportAsPNG } from "../../scripts/Export/ExportAsPNG";
import { ExportAsPDF } from "../../scripts/Export/ExportAsPDF";
import { ExportAsExcel } from "../../scripts/Export/ExportAsExcel";

export default function ExportAsComponent() {
  const handlePNG = () => {
    ExportAsPNG();
  };

  const handlePDF = () => {
    ExportAsPDF();
  };

  const handleExcel = () => {
    ExportAsExcel();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          Export As
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handlePNG}>
          <FileImage className="h-4 w-4" />
          PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF}>
          <FileText className="h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcel}>
          <Table className="h-4 w-4" />
          Excel Sheet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
