let cachedTimetableData;
export function exportCal() {
  const blob = new Blob([generateICSFileData()], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "BrockTimetable.ics";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateICSFileData() {
  let ICSData =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Brock Timetable//Brock Timetable//EN\n";
  const courses = cachedTimetableData.courses;
  for (let i = 0; i < courses.length; i++) {
    const courseCode = courses[i].courseCode;
    const mainComponents = cachedTimetableData.courses[i].mainComponents;
    for (let j = 0; j < mainComponents.length; j++) {
      let component = mainComponents[j];
      if (
        !component.schedule.time ||
        component.schedule.time == "Project Course"
      ) {
        continue;
      }
      ICSData = ICSData + addComponent(component, courseCode);
    }

    let secondaryComponents =
      cachedTimetableData.courses[i].secondaryComponents;
    if (secondaryComponents.lab) {
      let component = secondaryComponents.lab;
      if (
        component.schedule.time ||
        component.schedule.time == "Project Course"
      ) {
        ICSData = ICSData + addComponent(component, courseCode);
      }
    }

    if (secondaryComponents.seminar) {
      let component = secondaryComponents.seminar;
      if (
        component.schedule.time ||
        component.schedule.time == "Project Course"
      ) {
        ICSData = ICSData + addComponent(component, courseCode);
      }
    }

    if (secondaryComponents.tutorial) {
      let component = secondaryComponents.tutorial;
      if (
        component.schedule.time ||
        component.schedule.time == "Project Course"
      ) {
        ICSData = ICSData + addComponent(component, courseCode);
      }
    }
  }
  ICSData = ICSData + "END:VCALENDAR";
  return ICSData;
}

//Used to find the Unix timestamp of the next occurance of a day and time after the passed in timestamp.
//For example: Find the exact timestamp at which an event occurs based on passing in the semester start timestamp, and time and the day array of event.
function findPreciseEventTimestamp(baseTimestamp, daysArray, time) {
  const dayMap = {
    U: 0,
    M: 1,
    T: 2,
    W: 3,
    R: 4,
    F: 5,
    S: 6,
  };
  const baseDate = new Date(baseTimestamp * 1000);
  const baseDay = baseDate.getDay();
  const firstDay = daysArray[0];
  const targetDay = dayMap[firstDay];
  const startHour = parseInt(time.padStart(4, "0").slice(0, 2), 10);
  const startMinute = parseInt(time.slice(-2), 10);
  let preciseDate = baseDate;
  let preciseTimestamp;
  let daysUntil = (targetDay - baseDay + 7) % 7;
  preciseDate.setDate(preciseDate.getDate() + daysUntil);

  preciseDate.setHours(startHour);
  preciseDate.setMinutes(startMinute);

  preciseTimestamp = Math.floor(preciseDate.getTime() / 1000);

  return preciseTimestamp;
}

function generateICSEvent(
  startTimestamp,
  endTimestamp,
  endReoccurTimestamp,
  days,
  title,
  description
) {
  const dayICSMap = {
    U: "SU",
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA",
  };
  let EventData = "BEGIN:VEVENT\n";
  EventData = EventData + "UID:" + self.crypto.randomUUID() + "\n";
  EventData =
    EventData + "DTSTAMP:" + generateICSTimeStampFromDate(new Date()) + "\n";
  EventData =
    EventData +
    "DTSTART:" +
    generateICSTimeStampFromDate(new Date(startTimestamp * 1000)) +
    "\n";
  EventData =
    EventData +
    "DTEND:" +
    generateICSTimeStampFromDate(new Date(endTimestamp * 1000)) +
    "\n";
  EventData =
    EventData +
    "RRULE:FREQ=WEEKLY;" +
    "UNTIL=" +
    generateICSTimeStampFromDate(new Date(endReoccurTimestamp * 1000)) +
    ";BYDAY=";
  for (let i = 0; i < days.length; i++) {
    EventData = EventData + dayICSMap[days[i]];
    if (i != days.length - 1) {
      EventData = EventData + ",";
    }
  }
  EventData = EventData + ";\n";
  EventData = EventData + "SUMMARY:" + title + "\n";
  if (description) {
    EventData = EventData + "DESCRIPTION:" + description + "\n";
  }
  EventData = EventData + "END:VEVENT\n";

  return EventData;
}

function addComponent(component, courseCode) {
  const componentdaysArray = component.schedule.days.replace(" ", "").split("");
  const startTime = component.schedule.time.replace(" ", "").split("-")[0];
  const endTime = component.schedule.time.replace(" ", "").split("-")[1];
  const firststartTimestamp = findPreciseEventTimestamp(
    component.schedule.startDate,
    componentdaysArray,
    startTime
  );
  const firstendTimestamp = findPreciseEventTimestamp(
    component.schedule.startDate,
    componentdaysArray,
    endTime
  );
  return generateICSEvent(
    firststartTimestamp,
    firstendTimestamp,
    component.schedule.endDate,
    componentdaysArray,
    courseCode + " " + component.type,
    component.instructor
  );
}

function generateICSTimeStampFromDate(date) {
  const pad = (n) => String(n).padStart(2, "0");

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function updateExportData(timetableData) {
  cachedTimetableData = timetableData;
}
