import React from "react";
import SortDropdown from "./SortDropdown";
import BorderBox from "../../UI/BorderBox";

export default function SortOptions({ sortChoice, handleSortChange }) {
  return (
    <BorderBox title="Sort Options">
      <SortDropdown value={sortChoice} onChange={handleSortChange} />
    </BorderBox>
  );
}
