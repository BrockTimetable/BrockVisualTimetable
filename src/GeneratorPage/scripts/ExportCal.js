let CachedTimetableData;
export function exportCal() {
    const blob = new Blob([generateICSData()], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "BrockTimetable.ics";
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateICSData() {
    let ICSData;

    return ICSData;
}

export function updateExportData(timetableData) {
    CachedTimetableData = timetableData;
}
