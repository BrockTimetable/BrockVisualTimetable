# Brock Timetable Design Overhaul

> Status: this is the original design backlog, retained as a specification. Some items were implemented in follow-up work, so the unchecked boxes are not a current completion report. See [docs/UX_REVIEW.md](docs/UX_REVIEW.md) for verified work and remaining items. The section explorer and calendar-event text changes are intentionally deferred.

## Goal

Rebuild the generator as a calm, modern timetable-building workspace. The experience should guide users through:

1. Adding courses
2. Reviewing generated schedules
3. Refining sections and constraints
4. Sharing or exporting a timetable

Avoid gradients, decorative effects, excessive cards, saturated red surfaces, and passive instructional panels.

## Phase 1 — Establish the visual system

- [ ] Define a consistent light and dark color token system in `src/styles/index.css`.
  - [ ] Use neutral backgrounds, surfaces, borders, and text colors.
  - [ ] Use Brock red as an accent rather than the background of every section header.
  - [ ] Separate brand accent, destructive/error, warning, and conflict colors.
  - [ ] Make dark mode use a muted accent and sufficient surface separation.
- [ ] Standardize border, radius, spacing, and elevation tokens.
- [ ] Replace uppercase section headings and excessive letter spacing with sentence-case headings.
- [ ] Establish a small typography scale for headings, body text, labels, and metadata.
- [ ] Use a consistent system/modern sans-serif font stack.
- [ ] Remove unnecessary shadows, gradients, and inconsistent gray values.

## Phase 2 — Rebuild the generator information architecture

- [ ] Replace the current stack of red collapsible panels with a unified sidebar/workspace layout.
- [ ] Keep the calendar visible as the primary workspace; do not hide it behind a collapsible section.
- [ ] Organize the sidebar around user tasks instead of implementation concepts:
  - [ ] `Add courses`
  - [ ] `Your courses`
  - [ ] `Schedule preferences`
  - [ ] `Share and export`
- [ ] Consolidate term, timetable type, course search, sorting, and course management into the sidebar flow.
- [ ] Make the sidebar layout responsive without changing the mental model on mobile.
- [ ] Update `src/pages/GeneratorPage.jsx` to reflect the new hierarchy.
- [ ] Replace or substantially simplify `src/components/generator/UI/BorderBox.jsx`.

## Phase 3 — Improve the first-use flow

- [ ] Add an explicit empty-state message near course search: “Add your courses to generate possible schedules.”
- [ ] Use task-oriented copy after the first course is added.
- [ ] Add contextual hints beside the relevant interaction instead of a permanent Tips panel.
- [ ] Remove or redesign `src/components/generator/Forms/Settings/Tips.jsx`.
- [ ] Make the course search placeholder and validation copy clear and example-driven.
- [ ] Ensure the first primary action is visually obvious and has a useful disabled state.
- [ ] Rework or remove the floating `IntroGuideWidget` if inline guidance makes it redundant.

## Phase 4 — Redesign course management

- [ ] Simplify each course row so it clearly shows course code, course name, color, and removal/reordering controls.
- [ ] Replace the current expandable course details with a deliberate “View sections” action.
- [ ] Add a course section explorer using a side sheet or dialog.
- [ ] Group section choices by component type:
  - [ ] Lectures
  - [ ] Labs
  - [ ] Tutorials
  - [ ] Seminars
- [ ] Show each section as a compact row containing days, time, instructor, location, and date range where available.
- [ ] Add clear selected, pinned, and unavailable states.
- [ ] Add a `Show on calendar` interaction that highlights a section without cluttering the main calendar.
- [ ] Support filtering or sorting within the explorer for large lists of sections.
- [ ] Make all seminar times and other secondary component options easy to inspect visually.
- [ ] Use the existing course data shape in `src/lib/generator/courseData.js` as the source for the explorer.
- [ ] Update `src/components/generator/Forms/CourseList/CourseListItemComponent.jsx` and related course-list components.

## Phase 5 — Redesign the calendar workspace

- [ ] Remove the red collapsible Calendar header.
- [ ] Create a quiet calendar toolbar with:
  - [ ] Schedule count and navigation
  - [ ] Duration selector
  - [ ] Conflict/truncation/status indicators
- [ ] Use neutral navigation controls and reserve accent color for selected states.
- [ ] Improve course event readability at normal and narrow widths.
- [ ] Show course code, component type, and time without unnecessary truncation.
- [ ] Reduce calendar grid contrast while preserving time/day scanning.
- [ ] Make conflicts visually distinct without turning the whole calendar into an error state.
- [ ] Keep pinning and time blocking discoverable through contextual affordances.
- [ ] Update `src/components/generator/Calendar/CalendarNavBar.jsx`.
- [ ] Update `src/styles/generator/CustomCalendar.css` and `src/styles/generator/Calendar.css`.

## Phase 6 — Simplify or replace the timeline

- [ ] Decide whether the timeline helps users make a decision. Remove it if it does not.
- [ ] If retained, rename it to `Term overview` and make it a small secondary control.
- [ ] Represent duration ranges as explicit selectable segments or buttons.
- [ ] Remove the hover interpolation behavior and pulsing selected-date line.
- [ ] Make the selected range visually obvious without animation.
- [ ] Ensure the timeline does not duplicate the calendar or compete with it for attention.
- [ ] Refactor `src/components/generator/Calendar/CourseTimelineComponent.jsx`.

## Phase 7 — Share and export actions

- [ ] Replace “Share / Save Timetable” with copy that describes the actual behavior, such as `Copy timetable link`.
- [ ] Use a consistent action bar with equal-height buttons.
- [ ] Make the primary action copy the current timetable link.
- [ ] Make `Export .ics` the secondary action.
- [ ] Move import instructions into a small popover or the guide instead of a large expandable block.
- [ ] Remove ambiguous “save” language unless a separate save feature is implemented.
- [ ] Update `src/components/generator/Forms/Settings/ExportOptions.jsx` and export button components.

## Phase 8 — Remove unnecessary collapsible behavior

- [ ] Keep primary controls and current state visible by default.
- [ ] Reserve disclosure controls for advanced settings, help, or long secondary content.
- [ ] Remove custom height/opacity animation from primary layout sections where it adds friction.
- [ ] Audit all uses of `Collapsible` and classify each as primary, secondary, or removable.

## Phase 9 — Responsive and accessibility review

- [ ] Verify the new flow at desktop, tablet, and mobile widths.
- [ ] Ensure every icon-only control has an accessible label.
- [ ] Ensure section explorer rows are keyboard navigable.
- [ ] Ensure selected, pinned, blocked, unavailable, and conflict states are not communicated by color alone.
- [ ] Check dark-mode contrast for text, borders, events, buttons, and status indicators.
- [ ] Preserve drag-and-drop functionality while providing a keyboard-accessible reorder path.
- [ ] Add or update component interaction tests for the new flow.

## Suggested implementation order

1. Visual tokens and typography
2. Sidebar/workspace information architecture
3. Course rows and section explorer
4. Calendar toolbar and event styling
5. Share/export action bar
6. Timeline decision and implementation
7. Contextual guidance and onboarding cleanup
8. Responsive, accessibility, and interaction testing

## Completion criteria

- [ ] A first-time user can tell what to do within five seconds of opening the generator.
- [ ] All controls that affect timetable generation are discoverable in one coherent sidebar flow.
- [ ] Users can inspect every available lecture, lab, tutorial, and seminar option without overcrowding the calendar.
- [ ] The calendar is the visual focus of the populated state.
- [ ] Light and dark mode use the same design language.
- [ ] Sharing and export actions are obvious, consistent, and accurately labeled.
- [ ] No primary workflow depends on discovering a collapsed section or reading a permanent Tips panel.
