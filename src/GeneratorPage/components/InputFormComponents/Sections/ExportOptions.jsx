import React, { useState } from "react";
import Box from "@mui/material/Box";
import BorderBox from "./BorderBox";
import ExportCalendarButton from "../../ExportCalendarButton";
import { ListItemButton } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ExportOptions() {
  const [showHelp, setShowHelp] = useState(false);
  const theme = useTheme();

  return (
    <BorderBox title="Export Options">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Main export section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
          }}
        >
          <ExportCalendarButton />
        </Box>

        {/* Help section */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
          }}
        >
          <ListItemButton
            onClick={() => setShowHelp(!showHelp)}
            sx={{
              borderRadius: 1,
              mb: showHelp ? 1 : 0,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <InfoOutlinedIcon
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
              }}
            />
            <ListItemText
              primary="How to use the .ics file"
              primaryTypographyProps={{
                color: "text.secondary",
                variant: "body2",
              }}
            />
            {showHelp ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={showHelp} timeout="auto" unmountOnExit>
            <Box
              sx={{
                pl: 4,
                pr: 2,
                pb: 2,
                "& .MuiListItem-root": {
                  py: 0.5,
                },
              }}
            >
              <List sx={{ listStyle: "decimal", pl: 2 }}>
                <ListItem sx={{ display: "list-item" }}>
                  <ListItemText
                    primary="Open your calendar app"
                    secondary={
                      <>
                        Google Calendar: Go to calendar.google.com
                        <br />
                        Apple Calendar: Open the Calendar app
                        <br />
                        Outlook: Go to outlook.com/calendar
                      </>
                    }
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem sx={{ display: "list-item" }}>
                  <ListItemText
                    primary="Find the import option"
                    secondary={
                      <>
                        Google Calendar: Click the gear icon (Settings) → Import
                        & Export
                        <br />
                        Apple Calendar: File → Import
                        <br />
                        Outlook: Click the gear icon → View all Outlook settings
                        → Calendar → Import calendar
                      </>
                    }
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem sx={{ display: "list-item" }}>
                  <ListItemText
                    primary="Select the downloaded .ics file"
                    secondary="Choose the .ics file you downloaded from this app"
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem sx={{ display: "list-item" }}>
                  <ListItemText
                    primary="Confirm the import"
                    secondary="Your courses will be added to your calendar. You can choose which calendar to add them to (e.g., 'Work', 'Personal', etc.)"
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              </List>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </BorderBox>
  );
}
