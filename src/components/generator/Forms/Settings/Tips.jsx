import BorderBox from "../../UI/BorderBox";

export default function Tips() {
  return (
    <BorderBox title="Tips">
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Pin a course section by clicking on it in the calendar.</li>
        <li>
          Block out a time slot by clicking and dragging over the desired time
          in the calendar.
        </li>
      </ul>
    </BorderBox>
  );
}
