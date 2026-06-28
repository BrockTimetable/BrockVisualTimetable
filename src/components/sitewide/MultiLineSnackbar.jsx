import { SnackbarContent } from "notistack";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const MultiLineSnackbar = ({ message, className }) => {
  return (
    <SnackbarContent>
      <div className={cn("text-sm", className)}>
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
  className: PropTypes.string,
};
