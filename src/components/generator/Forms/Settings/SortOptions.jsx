import PropTypes from "prop-types";
import SortDropdown from "./SortDropdown";
import BorderBox from "../../UI/BorderBox";

export default function SortOptions({ sortChoice, handleSortChange }) {
  return (
    <BorderBox title="Sort Options">
      <SortDropdown value={sortChoice} onValueChange={handleSortChange} />
    </BorderBox>
  );
}

SortOptions.propTypes = {
  sortChoice: PropTypes.string.isRequired,
  handleSortChange: PropTypes.func.isRequired,
};
