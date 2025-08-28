import React, { useState, useEffect } from "react";
import {
  Popover,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";

export default function RenameBlockedSlotDialog({
  open,
  onClose,
  onSave,
  currentTitle = "",
  isCreating = false,
  isMultipleBlocks = false,
  anchorEl,
  anchorPosition,
  forceAnchorPosition, // New prop for forced positioning
}) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState("");

  // Simple mobile detection
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    setTitle(currentTitle);
    setError("");
  }, [currentTitle, open]);

  const handleSave = () => {
    const trimmedTitle = title.trim();

    // Validation - only check length, allow empty titles
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
    <Box sx={{ minWidth: 200 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {isCreating
          ? isMultipleBlocks
            ? "Name Your Blocked Times"
            : "Name Your Blocked Time"
          : isMultipleBlocks
            ? "Rename Blocked Times"
            : "Rename Blocked Time"}
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        {isCreating
          ? isMultipleBlocks
            ? "Give these blocked time slots a name to help you remember what they're for."
            : "Give this blocked time slot a name to help you remember what it's for."
          : isMultipleBlocks
            ? "Update the name for these blocked time slots."
            : "Update the name for this blocked time slot."}
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
        helperText={error || "Optional - e.g., Work, Gym, Study, Meeting"}
        inputProps={{
          maxLength: 50,
        }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          onClick={handleClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          sx={{ minWidth: 80 }}
        >
          {isCreating ? "Create Block" : "Save"}
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
      <DialogContent sx={{ p: 3 }}>{dialogContent}</DialogContent>
    </Dialog>
  ) : (
    <Popover
      open={open}
      anchorEl={forceAnchorPosition ? null : anchorEl}
      anchorPosition={
        forceAnchorPosition ||
        (anchorEl ? undefined : { top: 100, left: window.innerWidth / 2 })
      }
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
        forceAnchorPosition || anchorEl ? "anchorPosition" : "anchorEl"
      }
      sx={{
        "& .MuiPopover-paper": {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          p: 3,
        },
      }}
    >
      {dialogContent}
    </Popover>
  );
}
