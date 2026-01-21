import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactGA from "react-ga4";
import { NavbarComponent } from "@/components/guide";
import FooterComponent from "@/components/sitewide/FooterComponent";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

function GuidePage() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    ReactGA.send({
      hitType: "pageview",
      page: "Guide",
      title: "Brock Visual Guide",
    });
  }, []);

  const [openCourseCode, setOpenCourseCode] = useState(false);
  const [openAndOr, setOpenAndOr] = useState(false);
  const [openTermSpecific, setOpenTermSpecific] = useState(false);
  const [openContextCredits, setOpenContextCredits] = useState(false);
  const [openElectiveCredits, setOpenElectiveCredits] = useState(false);

  const Disclosure = ({ title, open, onOpenChange, children }) => (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="overflow-hidden rounded-md border border-border">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between bg-card px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/40"
          >
            <span>{title}</span>
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="space-y-3 px-4 py-3 text-sm text-muted-foreground">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );

  return (
    <div className="flex min-w-[350px] flex-col items-center">
      <div className="w-full max-w-[1280px]">
        <NavbarComponent />
        <div className="mx-auto w-full max-w-[960px] px-2 py-4 sm:px-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Guide to Course Registration
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Welcome to the Brock Visual TimeTable! This guide will help you
                learn everything you need to know about course planning &amp;
                registration at Brock University. This guide is written by
                students, for students. We understand the struggles of course
                registration and have created this platform to help you make the
                process easier.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                In this guide, you will learn how to find your courses, plan
                your schedule, and register for courses. This guide is designed
                to be simple and easy to follow. This guide is for all students
                at Brock University, including first-year students, upper-year
                students, and transfer students.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This guide will be running through creating a first-year
                computer science co-op student&apos;s timetable. The process is
                the same for all students, but the courses you need to take will
                be different.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                The Brock Visual TimeTable is not affiliated with Brock
                University. We are students who have created this tool to help
                other students. We are not responsible for any errors or issues
                that may arise from using this tool. Please ensure you
                double-check your timetable before registering for courses.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Requirements</h2>
              <p className="text-sm text-muted-foreground">
                Make sure you&apos;ve{" "}
                <a
                  href="https://discover.brocku.ca/next-steps/#activate-your-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  activated
                </a>{" "}
                your Brock email account at least 24 hours in advance and have
                your email and password ready. You will need to log in to your
                student portal to register for courses.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Step 1: Find Your Courses
              </h2>
              <p className="text-sm text-muted-foreground">
                The first step to course registration is finding the courses you
                want to take. Go to the{" "}
                <a
                  href="https://brocku.ca/webcal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  Brock University Course Calendar
                </a>{" "}
                and select your year, then program from the Table of Contents.
                Scroll down to find your specific program and the courses you
                need to take. You should see something similar to the image
                below.
              </p>
              <div className="rounded-md border border-border p-2">
                <img
                  src="/guide/course-calendar.png"
                  alt="Course Calendar"
                  className="h-auto w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This is a list of all the courses you will need to take for a
                given term. Above, you can see the courses required for the
                first term of a first-year computer science co-op student.
                Let&apos;s break down everything you see here:
              </p>

              <div className="space-y-3">
                <Disclosure
                  title="Course Code"
                  open={openCourseCode}
                  onOpenChange={setOpenCourseCode}
                >
                  <p>
                    The course code is a unique identifier for each course.
                    Let&apos;s use <strong>COSC 1P02</strong> as an example. It
                    is made up of 4 distinct parts:
                  </p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>
                      COSC is the department acronym, meaning Computer Science.
                    </li>
                    <li>1 shows the year level (1 = first year).</li>
                    <li>
                      P tells the credit value (P = 0.5 credit, F = 1.0 credit).
                    </li>
                    <li>02 is the unique course number in the department.</li>
                  </ol>
                </Disclosure>
                <Disclosure
                  title="AND vs OR"
                  open={openAndOr}
                  onOpenChange={setOpenAndOr}
                >
                  <p>
                    Notice how some courses have <strong>AND</strong> and others
                    have <strong>OR</strong> between them. Looking at the image
                    above, you can see that{" "}
                    <strong>COSC 1P02 AND COSC 1P03</strong> are required. This
                    means you must take both courses. In the case of these
                    courses, COSC 1P02 is a prerequisite for COSC 1P03. Assuming
                    you are a first-year student, you will need to take COSC
                    1P02 in your first term and COSC 1P03 in your second term.
                  </p>
                  <p>
                    On the other hand, <strong>COSC 1P50 OR COSC 1P71</strong>{" "}
                    are required. This means you only need to take one of the
                    two courses. You can choose to take COSC 1P50 or COSC 1P71
                    in your first term. Both courses are not required.
                  </p>
                </Disclosure>
                <Disclosure
                  title="Term-specific Courses"
                  open={openTermSpecific}
                  onOpenChange={setOpenTermSpecific}
                >
                  <p>
                    In the example above, you can see that SCIE 0N90 is a
                    term-specific course. This means that you can only take this
                    course in the Winter term. You will need to plan your
                    schedule accordingly to ensure you can take this course.
                  </p>
                  <p>
                    In the case of SCIE 0N90, this doesn&apos;t have much impact
                    on your schedule, as this is a 0 credit course, that you
                    normally take on top of your regular course load.
                  </p>
                </Disclosure>
                <Disclosure
                  title="Context Credits"
                  open={openContextCredits}
                  onOpenChange={setOpenContextCredits}
                >
                  <p>
                    Context credits are courses that are required to give you a
                    broader understanding of different fields. At Brock, you
                    need to complete 1.0 context credit in Humanities, Social
                    Sciences, and Sciences. You can find the list of courses
                    that fulfill these requirements{" "}
                    <a
                      href="https://brocku.ca/webcal/2024/undergrad/areg.html#sec29"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      here
                    </a>
                    .
                  </p>
                </Disclosure>
                <Disclosure
                  title="Elective Credits"
                  open={openElectiveCredits}
                  onOpenChange={setOpenElectiveCredits}
                >
                  <p>
                    Elective credits are courses that you can choose freely from
                    any department. These allow you to explore other areas of
                    interest and can be used to fulfill additional requirements
                    or personal interests.
                  </p>
                </Disclosure>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Step 2: Create your Timetable
              </h2>
              <p className="text-sm text-muted-foreground">
                Once you have found the courses you need to take, you can start
                planning your timetable. You can use the{" "}
                <Link
                  className="text-primary underline underline-offset-4"
                  to="/"
                >
                  Brock Visual TimeTable
                </Link>{" "}
                to create your timetable. Simply input your courses, and the
                generator will create all possible timetables for you. You can
                then choose the timetable that works best for you.
              </p>
              <p className="text-sm text-muted-foreground">
                When adding courses to the generator, ensure that you are adding
                the course for the correct term. You can do this by adding
                D(number), where number is the term number. For fall and winter
                terms:
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  D1 is for 8 month courses, spanning from September to April.
                </li>
                <li>
                  D2 is for fall courses, spanning from September to December.
                </li>
                <li>
                  D3 is for winter courses, spanning from January to April.
                </li>
              </ol>
              <p className="text-sm text-muted-foreground">
                The durations used for spring &amp; summer courses are
                different. You can find the duration for each course in the{" "}
                <a
                  href="https://brocku.ca/guides-and-timetables/timetables/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  timetable
                </a>
                .
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This tool is not affiliated with Brock
                University. We are students who have created this tool to help
                other students. We are not responsible for any errors or issues
                that may arise from using this tool. Please ensure you
                double-check your timetable before registering for courses.
              </p>
              <div className="rounded-md border border-border p-2">
                <img
                  src="/guide/example-timetable.png"
                  alt="Example timetable"
                  className="h-auto w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This is an example of a timetable generated using the Brock
                Visual TimeTable. You can see I&apos;ve decided to take COSC
                1P02, COSC 1P50, MATH 1P66, and ECON 1P92 in my first term, and
                FILM 1F94 as an 8 month course. FILM 1F94 fills the context
                credit for Humanities, and ECON 1P92 fills half of the context
                credit for Social Sciences.
              </p>
              <p className="text-sm text-muted-foreground">
                You can also see that I&apos;ve blocked out every day from 8:00
                AM to 9:00 AM. This prevents the generator from scheduling any
                courses during this time. This is useful if you have other
                commitments during this time (e.g. work, volunteering, or
                sleeping in!).
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Step 3: Register for Courses
              </h2>
              <p className="text-sm text-muted-foreground">
                Once you have created your timetable, you can start registering
                for courses. Log in to your{" "}
                <a
                  href="https://my.brocku.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  student portal
                </a>{" "}
                and navigate to the course registration page (left side, about
                half way down the screen).
              </p>
              <div className="rounded-md border border-border p-2">
                <img
                  src="/guide/student-dashboard.png"
                  alt="Student portal dashboard"
                  className="h-auto w-full"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You can then select the term you want to register for and input
                the course codes for the courses you want to take. Make sure you
                add the correct components (e.g. lecture, tutorial, lab) for
                each course.
              </p>
              <p className="text-sm text-muted-foreground">
                Once you add a course, it will show up in the "List Of
                Registered Courses for Current Registration Period" list at the
                bottom of the page. The course will be automatically saved, so
                once it&apos;s added, you&apos;re good to go!
              </p>
            </div>
          </div>
        </div>
        <FooterComponent />
      </div>
    </div>
  );
}

export default GuidePage;
