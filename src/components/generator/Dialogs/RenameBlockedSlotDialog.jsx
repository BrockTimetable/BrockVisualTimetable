import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/lib/utils/screenSizeUtils";
import { Button } from "@/components/ui/button";

export default function RenameBlockedSlotDialog({
  open,
  onClose,
  onSave,
  currentTitle = "",
  isCreating = false,
  isMultipleBlocks = false,
  anchorEl,
  anchorPosition,
  forceAnchorPosition,
}) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState("");
  const virtualAnchorRef = useRef({
    getBoundingClientRect: () => new DOMRect(),
  });

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  const dialogTitle = isCreating
    ? isMultipleBlocks
      ? "Name Blocked Times"
      : "Name Blocked Time"
    : isMultipleBlocks
      ? "Rename Times"
      : "Rename Time";

  const dialogDescription = isMultipleBlocks
    ? "Label these time slots"
    : "Label this time slot";

  const fieldId = "block-name";
  const helperId = "block-name-helper";

  const formFields = (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={fieldId}>
        Block Name
      </label>
      <Input
        id={fieldId}
        autoFocus={!isMobile}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={handleKeyDown}
        aria-invalid={!!error}
        aria-describedby={helperId}
        maxLength={50}
      />
      <p
        id={helperId}
        className={cn(
          "text-xs",
          error ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {error || "e.g., Work, Gym"}
      </p>
    </div>
  );

  const actions = (
    <div className="flex justify-end gap-2">
      <Button
        onClick={handleClose}
        size="sm"
        variant="ghost"
        className="min-w-[60px] text-muted-foreground"
      >
        Cancel
      </Button>
      <Button onClick={handleSave} size="sm" className="min-w-[60px]">
        {isCreating ? "Create" : "Save"}
      </Button>
    </div>
  );

  const popoverContent = (
    <div className="min-w-[220px] space-y-3">
      <div className="space-y-1">
        <div className="text-base font-semibold">{dialogTitle}</div>
        <div className="text-sm text-muted-foreground">{dialogDescription}</div>
      </div>
      {formFields}
      {actions}
    </div>
  );

  useEffect(() => {
    if (!open) return;
    const preferredAnchorPosition = forceAnchorPosition || anchorPosition;
    let x = window.innerWidth / 2;
    let y = 100;

    if (
      preferredAnchorPosition?.left != null &&
      preferredAnchorPosition?.top != null
    ) {
      x = preferredAnchorPosition.left;
      y = preferredAnchorPosition.top;
    } else if (anchorEl?.getBoundingClientRect) {
      const rect = anchorEl.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.bottom;
    }

    virtualAnchorRef.current = {
      getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
    };
  }, [open, anchorEl, anchorPosition, forceAnchorPosition]);

  return isMobile ? (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {formFields}
          {actions}
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <PopoverAnchor virtualRef={virtualAnchorRef} />
      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={8}
        className="w-[280px]"
      >
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}
