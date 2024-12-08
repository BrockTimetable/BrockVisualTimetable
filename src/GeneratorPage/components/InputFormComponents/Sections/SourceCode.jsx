import React from "react";
import Box from "@mui/material/Box";
import GitHubButton from "../GitHubButton";
import BorderBox from "./BorderBox";

export default function SourceCode() {
    return (
        <BorderBox title="Source Code">
            <GitHubButton />
        </BorderBox>
    );
}