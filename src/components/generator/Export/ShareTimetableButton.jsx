import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MultiLineSnackbar from "@/components/sitewide/MultiLineSnackbar";

// Copies text to the clipboard, falling back to a temporary textarea for
// browsers/contexts where the async Clipboard API is unavailable (e.g. http).
const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!succeeded) {
    throw new Error("Clipboard copy command was rejected");
  }
};

export default function ShareTimetableButton({ timetables }) {
  const { enqueueSnackbar } = useSnackbar();

  // The URL only encodes a shareable snapshot once a real timetable exists.
  const canShare =
    timetables.length > 0 && (timetables[0]?.courses?.length ?? 0) > 0;

  const handleShare = async () => {
    try {
      await copyToClipboard(window.location.href);
      enqueueSnackbar(
        <MultiLineSnackbar
          className="text-center"
          message={
            "Successfully copied link to clipboard!\nShare it with others or write it down to open this timetable again at a later time."
          }
        />,
        { variant: "success" },
      );
    } catch (error) {
      enqueueSnackbar(
        <MultiLineSnackbar
          className="text-center"
          message={
            "Couldn't copy the link automatically.\nCopy the URL from your address bar instead."
          }
        />,
        { variant: "error" },
      );
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={!canShare}
      className="transition-none"
      title={
        canShare
          ? "Copy a link to this exact timetable"
          : "Add a course to create a shareable timetable"
      }
    >
      <Share2 />
      Share / Save Timetable
    </Button>
  );
}

ShareTimetableButton.propTypes = {
  timetables: PropTypes.array.isRequired,
};
