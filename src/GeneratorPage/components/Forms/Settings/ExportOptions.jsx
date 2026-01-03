import { useState } from "react";
import BorderBox from "../../UI/BorderBox";
import ExportCalendarButton from "../../Export/ExportCalendarButton";
import { Info, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import { Separator } from "../../../../components/ui/separator";
import { Button } from "../../../../components/ui/button";

export default function ExportOptions() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <BorderBox title="Export Options">
      <div className="space-y-4">
        <div className="flex justify-center p-1">
          <ExportCalendarButton />
        </div>

        <Separator />
        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                How to use the .ics file
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showHelp ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ol className="list-decimal space-y-2 pl-6 text-sm">
              <li>
                <div className="font-medium">Open your calendar app</div>
                <div className="text-muted-foreground">
                  Google Calendar: Go to calendar.google.com
                  <br />
                  Apple Calendar: Open the Calendar app
                  <br />
                  Outlook: Go to outlook.com/calendar
                </div>
              </li>
              <li>
                <div className="font-medium">Find the import option</div>
                <div className="text-muted-foreground">
                  Google Calendar: Click the gear icon (Settings) → Import &
                  Export
                  <br />
                  Apple Calendar: File → Import
                  <br />
                  Outlook: Click the gear icon → View all Outlook settings →
                  Calendar → Import calendar
                </div>
              </li>
              <li>
                <div className="font-medium">
                  Select the downloaded .ics file
                </div>
                <div className="text-muted-foreground">
                  Choose the .ics file you downloaded from this app
                </div>
              </li>
              <li>
                <div className="font-medium">Confirm the import</div>
                <div className="text-muted-foreground">
                  Your courses will be added to your calendar. You can choose
                  which calendar to add them to (e.g., Work, Personal, etc.)
                </div>
              </li>
            </ol>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </BorderBox>
  );
}
