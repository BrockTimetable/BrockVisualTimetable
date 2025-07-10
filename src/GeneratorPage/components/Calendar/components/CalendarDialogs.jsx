import React from "react";
import TruncationDialog from "../../Dialogs/TruncationDialog";
import NoTimetablesDialog from "../../Dialogs/NoTimetablesDialog";
import BlockedSlotsDialog from "../../Dialogs/BlockedSlotsDialog";

export const CalendarDialogs = ({
  truncationDialogOpen,
  setTruncationDialogOpen,
  noTimetablesDialogOpen,
  setNoTimetablesDialogOpen,
  timeslotsOverriddenDialogOpen,
  setTimeslotsOverriddenDialogOpen,
}) => {
  const handleCloseTruncationDialog = () => {
    setTruncationDialogOpen(false);
  };

  const handleCloseNoTimetablesDialog = () => {
    setNoTimetablesDialogOpen(false);
  };

  const handleCloseBlockedSlotsDialog = () => {
    setTimeslotsOverriddenDialogOpen(false);
  };

  return (
    <>
      <TruncationDialog
        truncationDialogOpen={truncationDialogOpen}
        handleCloseTruncationDialog={handleCloseTruncationDialog}
      />
      <NoTimetablesDialog
        noTimetablesDialogOpen={noTimetablesDialogOpen}
        handleCloseNoTimetablesDialog={handleCloseNoTimetablesDialog}
      />
      <BlockedSlotsDialog
        timeslotsOverriddenDialogOpen={timeslotsOverriddenDialogOpen}
        handleCloseBlockedSlotsDialog={handleCloseBlockedSlotsDialog}
      />
    </>
  );
};
