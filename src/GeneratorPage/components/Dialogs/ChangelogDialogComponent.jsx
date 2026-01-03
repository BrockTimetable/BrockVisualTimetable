import { MessageSquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/dialog";

const ChangelogDialogComponent = ({ open, handleClose }) => {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4 text-sm">
          <h2 className="text-base font-semibold">
            Fall/Winter 2025-2026 Update
          </h2>
          <p>
            Fall/Winter 2025-2026 course offerings are now available in the
            timetable generator!<br></br>Registration opens based on credit
            count at 6AM on the Brock portal!<br></br>
            <br></br>New students: June 24, 2025<br></br>Transfer Students with
            over 5.0 credits: July 10, 2025<br></br>15.0 credits or more: July
            3, 2025<br></br>10.0 credits or more: July 10, 2025<br></br>9.5
            credits or less: July 17, 2025.
          </p>
          <h2 className="text-base font-semibold">Tutorial Video</h2>
          <p>
            To ensure you have a smooth and efficient experience while creating
            your timetable, we highly recommend watching the tutorial video
            below.
          </p>
          <video width="100%" height="auto" controls autoPlay>
            <source src="/BrockTimeTableTutorial.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>NOTE:</strong> The Brock Visual Timetable is not affiliated
            with, partnered, or endorsed by Brock University. The accuracy and
            availability of this application is not guaranteed.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button asChild variant="outline">
            <a
              href="https://github.com/BrockTimetable/BrockVisualTimetable/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </a>
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogDialogComponent;
