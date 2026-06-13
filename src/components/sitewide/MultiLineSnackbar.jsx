import { SnackbarContent } from "notistack";
import PropTypes from "prop-types";

const MultiLineSnackbar = ({ message }) => {
  return (
    <SnackbarContent>
      <div className="text-sm">
        {message.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </div>
    </SnackbarContent>
  );
};

export default MultiLineSnackbar;

MultiLineSnackbar.propTypes = {
  message: PropTypes.string.isRequired,
};
