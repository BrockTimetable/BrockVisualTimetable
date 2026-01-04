import React, { useState, useEffect } from "react";
import {
  Popover,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useIsMobile } from "../../../SiteWide/utils/screenSizeUtils";
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

  const dialogContent = (
    <Box sx={{ minWidth: 180 }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, fontSize: "1.1rem" }}
      >
        {isCreating
          ? isMultipleBlocks
            ? "Name Blocked Times"
            : "Name Blocked Time"
          : isMultipleBlocks
            ? "Rename Times"
            : "Rename Time"}
      </Typography>

      <Typography
        variant="body2"
        sx={{ mb: 2, color: "text.secondary", fontSize: "0.875rem" }}
      >
        {isMultipleBlocks ? "Label these time slots" : "Label this time slot"}
      </Typography>

      <TextField
        autoFocus={!isMobile}
        fullWidth
        label="Block Name"
        variant="outlined"
        size="small"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError("");
        }}
        onKeyPress={handleKeyPress}
        error={!!error}
        helperText={error || "e.g., Work, Gym"}
        inputProps={{
          maxLength: 50,
        }}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
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
      </Box>
    </Box>
  );

  return isMobile ? (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>{dialogContent}</DialogContent>
    </Dialog>
  ) : (
    <Popover
      open={open}
      anchorEl={forceAnchorPosition ? null : anchorEl}
      {...(forceAnchorPosition || !anchorEl
        ? {
            anchorPosition: forceAnchorPosition || {
              top: 100,
              left: window.innerWidth / 2,
            },
          }
        : {})}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      anchorReference={
        forceAnchorPosition
          ? "anchorPosition"
          : anchorEl
            ? "anchorEl"
            : "anchorPosition"
      }
      sx={{
        "& .MuiPopover-paper": {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          p: 2,
        },
      }}
    >
      {dialogContent}
    </Popover>
  );
}
