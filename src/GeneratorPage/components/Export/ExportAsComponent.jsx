import * as React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ExportAsPNG } from "../../scripts/Export/ExportAsPNG";
import { ExportAsPDF } from "../../scripts/Export/ExportAsPDF";
import { ExportAsExcel } from "../../scripts/Export/ExportAsExcel";

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
            <KeyboardArrowDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handlePNG}>
            <ImageIcon className="mr-2 h-4 w-4" />
            PNG
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handlePDF}>
            <PictureAsPdfIcon className="mr-2 h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExcel}>
            <TableChartIcon className="mr-2 h-4 w-4" />
            Excel Sheet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
