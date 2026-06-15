import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-M2NP1M6YSK";
const isAnalyticsEnabled = import.meta.env.PROD;

let initialized = false;

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const initializeAnalytics = () => {
  if (!isAnalyticsEnabled || initialized) return;

  ReactGA.initialize(GA_MEASUREMENT_ID);
  initialized = true;
};

export const trackPageView = ({ page, title }) => {
  if (!isAnalyticsEnabled) return;

  initializeAnalytics();
  ReactGA.event(
    "page_view",
    cleanParams({
      page_name: page,
      page_title: title,
      page_path:
        typeof window === "undefined" ? undefined : window.location.pathname,
      page_location:
        typeof window === "undefined" ? undefined : window.location.href,
    }),
  );
};

export const trackCourseAddResult = ({
  result,
  failureReason,
  subjectCode,
  courseLevel,
  duration,
  term,
  timetableType,
  courseCount,
}) => {
  if (!isAnalyticsEnabled) return;

  initializeAnalytics();
  ReactGA.event(
    "course_add_result",
    cleanParams({
      result,
      failure_reason: failureReason,
      subject_code: subjectCode,
      course_level: courseLevel,
      duration,
      term,
      timetable_type: timetableType,
      course_count: courseCount,
    }),
  );
};

export const trackScheduleGenerated = ({
  trigger,
  courseCount,
  resultCount,
  sortOption,
  hasResults,
  isTruncated,
}) => {
  if (!isAnalyticsEnabled) return;

  initializeAnalytics();
  ReactGA.event(
    "schedule_generated",
    cleanParams({
      trigger,
      course_count: courseCount,
      result_count: resultCount,
      sort_option: sortOption,
      has_results: hasResults,
      is_truncated: isTruncated,
    }),
  );
};

export const trackCalendarExportCompleted = ({
  courseCount,
  durationCount,
}) => {
  if (!isAnalyticsEnabled) return;

  initializeAnalytics();
  ReactGA.event(
    "calendar_export_completed",
    cleanParams({
      course_count: courseCount,
      duration_count: durationCount,
      export_path: "ics_download",
    }),
  );
};

export const trackTruncationWarning = () => {
  if (!isAnalyticsEnabled) return;

  initializeAnalytics();
  ReactGA.event("schedule_generated", {
    trigger: "truncation_warning",
    is_truncated: true,
    has_results: true,
  });
};
