const MultiLineSnackbar = ({ message }) => {
  return (
    <div className="text-sm leading-relaxed">
      {message.split("\n").map((line, index) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ))}
    </div>
  );
};

export default MultiLineSnackbar;
