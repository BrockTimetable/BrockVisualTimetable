import { SnackbarContent } from "notistack";

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
