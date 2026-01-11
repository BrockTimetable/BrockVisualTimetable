import React, { useState } from "react";
import BorderBox from "../../UI/BorderBox";
import ExportCalendarButton from "../../Export/ExportCalendarButton";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

export default function ExportOptions({ timetables, durations }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <BorderBox title="Export Options">
      <div className="flex flex-col gap-2">
        {/* Main export section */}
        <div className="flex justify-center">
          <ExportCalendarButton timetables={timetables} durations={durations} />
        </div>

        {/* Help section */}
        <div>
          <Separator className="mb-2" />
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Info className="h-4 w-4" />
              <span className="flex-1 text-left">How to use the .ics file</span>
              {showHelp ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <ol className="ml-6 mt-2 list-decimal space-y-2 pr-2 pb-2 text-sm text-muted-foreground">
                <li className="pl-2">
                  <div className="font-medium text-foreground">
                    Open your calendar app
                  </div>
                  <div className="mt-1 text-xs">
                    Google Calendar: Go to calendar.google.com
                    <br />
                    Apple Calendar: Open the Calendar app
                    <br />
                    Outlook: Go to outlook.com/calendar
                  </div>
                </li>
                <li className="pl-2">
                  <div className="font-medium text-foreground">
                    Find the import option
                  </div>
                  <div className="mt-1 text-xs">
                    Google Calendar: Click the gear icon (Settings) → Import &
                    Export
                    <br />
                    Apple Calendar: File → Import
                    <br />
                    Outlook: Click the gear icon → View all Outlook settings →
                    Calendar → Import calendar
                  </div>
                </li>
                <li className="pl-2">
                  <div className="font-medium text-foreground">
                    Select the downloaded .ics file
                  </div>
                  <div className="mt-1 text-xs">
                    Choose the .ics file you downloaded from this app
                  </div>
                </li>
                <li className="pl-2">
                  <div className="font-medium text-foreground">
                    Confirm the import
                  </div>
                  <div className="mt-1 text-xs">
                    Your courses will be added to your calendar. You can choose
                    which calendar to add them to (e.g., 'Work', 'Personal',
                    etc.)
                  </div>
                </li>
              </ol>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </BorderBox>
  );
}
