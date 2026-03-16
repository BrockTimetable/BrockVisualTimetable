const getCourseDetailFromEvent = (event) => {
  const titleParts = event.title.trim().split(" ");

  return {
    name: titleParts[0],
    courseName: event.extendedProps.courseName || "",
    instructor: event.description?.trim() || "",
    section: titleParts.pop(),
    startDate: event.startRecur,
    endDate: event.endRecur,
  };
};

const mergeCourseDetail = (existingDetail, nextDetail) => ({
  ...existingDetail,
  ...nextDetail,
  courseName: existingDetail.courseName || nextDetail.courseName,
  instructor: existingDetail.instructor || nextDetail.instructor,
  startDate: existingDetail.startDate || nextDetail.startDate,
  endDate: existingDetail.endDate || nextDetail.endDate,
});

export const buildCourseDetails = (events) =>
  Array.from(
    events
      .filter((event) => !event.extendedProps.isBlocked)
      .reduce((detailsByName, event) => {
        const nextDetail = getCourseDetailFromEvent(event);
        const existingDetail = detailsByName.get(nextDetail.name);

        detailsByName.set(
          nextDetail.name,
          existingDetail
            ? mergeCourseDetail(existingDetail, nextDetail)
            : nextDetail,
        );

        return detailsByName;
      }, new Map())
      .values(),
  );
