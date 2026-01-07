import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GUIDE_STORAGE_KEY = "hasSeenIntroGuide";

const guideSteps = [
  {
    id: "add-courses",
    title: "Add your courses",
    description:
      "Search for courses and add them to your list so the generator can build options.",
    videoSrc: "/intro/1.gif",
  },
  {
    id: "sort-block",
    title: "Sort and block off times",
    description: "Sort your options and block off times you want to keep free.",
    videoSrc: "/intro/2.gif",
  },
  {
    id: "export",
    title: "Pin courses, finalize schedule",
    description:
      "Pin the classes you want, lock in your timetable, and export when ready.",
    videoSrc: "/intro/3.gif",
  },
];

const IntroGuideWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!hasSeenGuide) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(GUIDE_STORAGE_KEY, "true");
  };

  const handleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, guideSteps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!isOpen) {
    return null;
  }

  const step = guideSteps[stepIndex];
  const isLastStep = stepIndex === guideSteps.length - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Quick Start Guide</CardTitle>
              <CardDescription className="text-xs">
                Step {stepIndex + 1} of {guideSteps.length}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close guide"
              onClick={handleClose}
            >
              <span className="text-lg leading-none">&times;</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            <img
              className="h-full w-full object-cover"
              src={step.videoSrc}
              alt={`${step.title} preview`}
              loading="lazy"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        </CardContent>
        <CardFooter className="w-full justify-between gap-2">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={isFirstStep}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Skip
            </Button>
            <Button onClick={isLastStep ? handleClose : handleNext}>
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntroGuideWidget;
