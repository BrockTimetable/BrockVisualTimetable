# UX review

Date: 2026-09-22  
Scope: Generator (`/`) and registration guide (`/guide`) in the Codex in-app browser. Reviewed at desktop width, 390px mobile width, and 320px narrow-mobile width; light and dark themes. No Playwright used.

## Findings

### P1 — The progress indicator does not reflect progress

The header continues to show “1 Add courses” after a course is added and schedules are generated. “Review” and “Share” remain visually inactive even though the user can review the calendar and share it. This makes the stepper feel decorative and misrepresents the workflow.

Recommendation: update the active step based on state, or remove the numbered progress treatment and keep the actions as plain labels.

### P1 — Course and term selectors silently lock after the first course

After adding a course, the timetable and term selectors become disabled. There is no visible explanation that the choices are locked or how to change them, so users may think the controls are broken.

Recommendation: add a short explanation and a clear way to change context (including what happens to already-added courses).

### P2 — Leaving for the Guide feels destructive

With a timetable present, choosing Guide opens a blocking “Your current timetable will be lost” confirmation. The timetable is encoded in the current URL and was restored with browser Back, so the warning needs to distinguish losing the current in-memory session from being able to return to the shared URL. As written, it makes a normal help-navigation action feel risky.

Recommendation: preserve the timetable when returning from the Guide, or explain the recovery path in the confirmation and offer a direct “copy timetable link” action there.

### P1 — Calendar event text is too small and gets truncated

On desktop, course, section, title, and instructor information is compressed inside the event blocks; longer names and instructors end in ellipses. The small text is difficult to scan, especially against the colored event backgrounds. The mobile schedule cards are easier to read, but their supporting text is still very small.

Recommendation: prioritize course/section and time, reduce or relocate secondary metadata, and provide a reliable way to inspect full details on touch as well as hover.

### P2 — Narrow phones are wider than the viewport

The generator and guide page roots set `min-width: 350px`. At a 320px viewport this forces horizontal overflow, making the page wider than the device.

Recommendation: remove the hard minimum and make the narrow layout reflow at 320px.

### P2 — On mobile, course management is below the calendar

The mobile order is course setup, schedule, then “Your courses” and sharing/export. Removing a course or inspecting its details therefore requires scrolling past the schedule; on a long schedule this separates course management from the add-course controls.

Recommendation: keep the course list closer to course setup, or provide a compact jump/shortcut to it.

### P2 — The no-course state gives the calendar too much empty space

With no courses added, the main panel still presents a tall, empty timetable grid. “No schedules yet” is tucked into the navigation area, while the blank grid dominates the page.

Recommendation: show a compact empty state in the calendar area with a direct cue to add a course; keep the full grid for when there is a schedule to inspect.

### P2 — Guide screenshots are hard to read on mobile

The course-calendar and timetable examples shrink to fit the narrow article column. Their embedded labels become too small to inspect, and there is no obvious way to open a larger version.

Recommendation: make each example tap-to-zoom/open, or provide a focused crop with a short caption.

### P3 — The guide has a long, repetitive introduction

Several introductory paragraphs repeat that the guide explains course planning and registration. The non-affiliation/verify-your-timetable disclaimer appears in the introduction and again in Step 2, delaying the first actionable step on mobile.

Recommendation: shorten the introduction to audience + purpose, and keep one concise disclaimer near the relevant action.

### P3 — Sharing and export are easy to miss on desktop

The share/export actions sit at the bottom of the sidebar beneath course management. They are visible, but visually read as a final settings group rather than the next step after reviewing a timetable.

Recommendation: give the actions a clearer relationship to the selected schedule, or move them closer to the calendar’s review controls.

## What worked during the review

- Course search returned options; choosing `COSC 1P02 D2` generated a timetable and enabled share/export.
- The duration label showed “Fall 2026” for the selected fall course.
- Course-detail disclosure expanded and showed instructor, section, and date range.
- Clicking a calendar section changed the available schedule count, confirming the pin interaction is connected to generation.
- At mobile width, the calendar switches to a weekday-grouped schedule view, and the navigation menu opens with Generator, Guide, and Feedback.
- The Guide accordions expand, and the theme toggle changes between light and dark modes.
- The Guide-navigation warning appears when leaving a populated timetable; browser Back restored the tested timetable URL.

## Review limits

Copying a share link and downloading an `.ics` file were not triggered. External Brock registration links were not opened. Findings are UX observations, not a full accessibility or browser-compatibility audit.

## Follow-up status

- [x] Progress indicator reflects adding courses, reviewing, and completing a share/export action.
- [ ] Selector lock explanation/recovery — removed at the user’s request; term and timetable selectors remain locked while courses are present.
- [x] Guide navigation carries the current timetable URL and returns to it without a destructive warning.
- [ ] Calendar event text sizing and truncation — intentionally excluded from this follow-up.
- [x] Removed the 350px minimum width and checked the layout at 320px.
- [x] Moved mobile course management next to course setup, above the schedule.
- [x] Replaced the empty calendar grid with a direct add-course action.
- [x] Guide images open in an enlarged, pannable view on small screens.
- [x] Shortened the guide introduction and consolidated its disclaimer.
- [x] Moved sharing/export into the left sidebar, beneath the course list, per follow-up request.

## Final readiness verification

Date: 2026-09-26

- Lint, `git diff --check`, all 33 tests, and the production build pass.
- Built-in browser checks confirmed the desktop grid, mobile and narrow-mobile weekday schedule, course-detail disclosure, theme toggle, feedback modal, and Guide return link.
- Share-link copying, calendar download, and feedback submission were not triggered during this check.
- The browser initially logged repeated React `flushSync` warnings from the calendar during load and responsive view changes. The date-range and responsive view updates are now deferred out of FullCalendar's commit lifecycle; a post-fix reload and mobile resize no longer reproduced that warning. React Router future-flag warnings remain.
- The production bundle warning is present on `origin/master`: baseline JavaScript is 838.77 KB (271.47 KB gzip), while the current build is 838.46 KB (270.69 KB gzip).
