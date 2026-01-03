import { useState, useEffect } from "react";
import {
  NavbarComponent,
  CalendarComponent,
  InputFormBottomComponent,
  InputFormTopComponent,
} from "./GeneratorPage/components";
import { useIsBelowMedium } from "./SiteWide/utils/screenSizeUtils";
import { CourseDetailsProvider } from "./GeneratorPage/contexts/CourseDetailsContext";
import { CourseColorsProvider } from "./GeneratorPage/contexts/CourseColorsContext";
import ChangelogDialogComponent from "./GeneratorPage/components/Dialogs/ChangelogDialogComponent";
import ReactGA from "react-ga4";
import {
  generateTimetables,
  getValidTimetables,
} from "./GeneratorPage/scripts/timetableGeneration/timetableGeneration";
import { clearAllCourseData } from "./GeneratorPage/scripts/courseData";
import { clearAllPins } from "./GeneratorPage/scripts/pinnedComponents";

function GeneratorPage() {
  ReactGA.send({
    hitType: "pageview",
    page: "Generator",
    title: "Brock Visual TimeTable",
  });
  const [timetables, setTimetables] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [durations, setDurations] = useState([]);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [addedCourses, setAddedCourses] = useState([]);
  const isBelowMedium = useIsBelowMedium();

  // Check if user has seen the changelog on mount
  useEffect(() => {
    const hasSeenChangelog = localStorage.getItem("hasSeenChangelog");
    if (!hasSeenChangelog) {
      setIsChangelogOpen(true);
    }
  }, []);

  // Clear all state when component unmounts
  useEffect(() => {
    return () => {
      clearAllCourseData();
      clearAllPins();
      setAddedCourses([]);
      setTimetables([]);
      setSelectedDuration("");
      setDurations([]);
      setSortOption("");
    };
  }, []);

  const handleCloseChangelog = () => {
    setIsChangelogOpen(false);
    localStorage.setItem("hasSeenChangelog", "true");
  };

  return (
    <CourseDetailsProvider>
      <CourseColorsProvider>
        <div className="flex min-w-[350px] justify-center">
          <div className="w-full max-w-[1280px] pb-8">
            <NavbarComponent />
            <div className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-0">
              <div className="md:col-span-4">
                <div className="m-0 sm:m-2">
                  <InputFormTopComponent
                    setTimetables={setTimetables}
                    setSelectedDuration={setSelectedDuration}
                    setDurations={setDurations}
                    setSortOption={setSortOption}
                    addedCourses={addedCourses}
                    setAddedCourses={setAddedCourses}
                  />
                  {!isBelowMedium && (
                    <div className="mt-4">
                      <InputFormBottomComponent
                        addedCourses={addedCourses}
                        setAddedCourses={setAddedCourses}
                        setTimetables={setTimetables}
                        sortOption={sortOption}
                        generateTimetables={generateTimetables}
                        getValidTimetables={getValidTimetables}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="m-0 sm:m-2 sm:mt-2">
                  <CalendarComponent
                    timetables={timetables}
                    setTimetables={setTimetables}
                    selectedDuration={selectedDuration}
                    setSelectedDuration={setSelectedDuration}
                    durations={durations}
                    sortOption={sortOption}
                  />
                </div>
              </div>
              {isBelowMedium && (
                <div className="md:col-span-12">
                  <div className="m-0 sm:m-2 sm:mt-2">
                    <InputFormBottomComponent
                      addedCourses={addedCourses}
                      setAddedCourses={setAddedCourses}
                      setTimetables={setTimetables}
                      sortOption={sortOption}
                      generateTimetables={generateTimetables}
                      getValidTimetables={getValidTimetables}
                    />
                  </div>
                </div>
              )}
            </div>
            <ChangelogDialogComponent
              open={isChangelogOpen}
              handleClose={handleCloseChangelog}
            />
          </div>
        </div>
      </CourseColorsProvider>
    </CourseDetailsProvider>
  );
}

export default GeneratorPage;
