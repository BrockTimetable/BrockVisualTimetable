import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useIsMobile } from "../../../SiteWide/utils/screenSizeUtils";

export default function RenameBlockedSlotDialog({
  open,
  onClose,
  onSave,
  currentTitle = "",
  isCreating = false,
  isMultipleBlocks = false,
}) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState("");

  const isMobile = useIsMobile();

  useEffect(() => {
    setTitle(currentTitle);
    setError("");
  }, [currentTitle, open]);

  const handleSave = () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 50) {
      setError("Title must be 50 characters or less");
      return;
    }

    onSave(trimmedTitle);
    handleClose();
  };

  const handleClose = () => {
    setTitle(currentTitle);
    setError("");
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreating
              ? isMultipleBlocks
                ? "Name Blocked Times"
                : "Name Blocked Time"
              : isMultipleBlocks
                ? "Rename Times"
                : "Rename Time"}
          </DialogTitle>
          <DialogDescription>
            {isMultipleBlocks
              ? "Label these time slots"
              : "Label this time slot"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="blocked-slot-name">Block Name</Label>
          <Input
            id="blocked-slot-name"
            autoFocus={!isMobile}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyPress}
            maxLength={50}
            aria-invalid={!!error}
          />
          <p className="text-xs text-muted-foreground">
            {error || "e.g., Work, Gym"}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isCreating ? "Create" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
