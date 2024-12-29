import React from "react";
import BorderBox from "./BorderBox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export default function SourceCode() {
    return (
        <BorderBox title="Tips">
            <List sx={{ listStyle: "disc", pl: 2 }}>
                <ListItem sx={{ display: "list-item", py: 0 }}>
                    <ListItemText primary="Pin a course section by clicking on it in the calendar." />
                </ListItem>
                <ListItem sx={{ display: "list-item", py: 0 }}>
                    <ListItemText primary="Block out a time slot by clicking and dragging over the desired time in the calendar." />
                </ListItem>
            </List>
        </BorderBox>
    );
}
