import PropTypes from "prop-types";
import BorderBox from "../../UI/BorderBox";
import ExportCalendarButton from "../../Export/ExportCalendarButton";
import ShareTimetableButton from "../../Export/ShareTimetableButton";

export default function ExportOptions({
  timetables,
  durations,
  onShareComplete,
  onExportComplete,
}) {
  return (
    <BorderBox title="Share and export">
      <div className="flex flex-col gap-2">
        <ShareTimetableButton
          timetables={timetables}
          onShareComplete={onShareComplete}
        />
        <ExportCalendarButton
          timetables={timetables}
          durations={durations}
          onExportComplete={onExportComplete}
        />
      </div>
    </BorderBox>
  );
}

ExportOptions.propTypes = {
  timetables: PropTypes.array.isRequired,
  durations: PropTypes.arrayOf(PropTypes.string).isRequired,
  onShareComplete: PropTypes.func,
  onExportComplete: PropTypes.func,
};
