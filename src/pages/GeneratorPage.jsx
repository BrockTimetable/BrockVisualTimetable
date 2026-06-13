import { useState, useEffect } from "react";
import {
  NavbarComponent,
  CalendarComponent,
  InputFormBottomComponent,
  InputFormTopComponent,
} from "@/components/generator";
import { useIsBelowMedium } from "@/lib/utils/screenSizeUtils";
import { CourseDetailsProvider } from "@/lib/contexts/generator/CourseDetailsContext";
import { CourseColorsProvider } from "@/lib/contexts/generator/CourseColorsContext";
import IntroGuideWidget from "@/components/generator/Dialogs/IntroGuideWidget";
import { trackPageView } from "@/lib/analytics";
import {
  generateTimetables,
  getValidTimetables,
} from "@/lib/generator/timetableGeneration/timetableGeneration";
import { clearAllCourseData } from "@/lib/generator/courseData";
import { clearAllPins } from "@/lib/generator/pinnedComponents";
import FooterComponent from "@/components/sitewide/FooterComponent";

function GeneratorPage() {
  useEffect(() => {
    trackPageView({
      page: "Generator",
      title: "Brock Visual TimeTable",
    });
  }, []);
  const [timetables, setTimetables] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [durations, setDurations] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [addedCourses, setAddedCourses] = useState([]);
  const isBelowMedium = useIsBelowMedium();

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

  return (
    <CourseDetailsProvider>
      <CourseColorsProvider>
        <div className="flex min-w-[350px] flex-col items-center">
          <div className="w-full max-w-[1280px]">
            <NavbarComponent />
            <div className="grid grid-cols-1 justify-center md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="mx-2 mt-2 md:mx-1">
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
                        timetables={timetables}
                        durations={durations}
                        sortOption={sortOption}
                        generateTimetables={generateTimetables}
                        getValidTimetables={getValidTimetables}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="mx-2 mt-0 sm:mt-2 md:mx-1">
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
                  <div className="mx-2 mt-0 sm:mt-2">
                    <InputFormBottomComponent
                      addedCourses={addedCourses}
                      setAddedCourses={setAddedCourses}
                      setTimetables={setTimetables}
                      timetables={timetables}
                      durations={durations}
                      sortOption={sortOption}
                      generateTimetables={generateTimetables}
                      getValidTimetables={getValidTimetables}
                    />
                  </div>
                </div>
              )}
            </div>
            <IntroGuideWidget />
            <FooterComponent />
          </div>
        </div>
      </CourseColorsProvider>
    </CourseDetailsProvider>
  );
}

export default GeneratorPage;
