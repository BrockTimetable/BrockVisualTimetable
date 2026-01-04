import { useEffect } from "react";

export const useTouchEvents = (elementId = "Calendar") => {
  useEffect(() => {
    const calendarElement = document.getElementById(elementId);
    let touchStartTimer;
    let isLongPress = false;

    const handleTouchStart = (event) => {
      touchStartTimer = setTimeout(() => {
        isLongPress = true;
        if (event.target.closest(`#${elementId}`)) {
          document.body.style.overflow = "hidden";
        }
      }, 500);
    };

    const handleTouchMove = (event) => {
      if (isLongPress) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      clearTimeout(touchStartTimer);
      document.body.style.overflow = "";
      isLongPress = false;
    };

    if (calendarElement) {
      calendarElement.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      calendarElement.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      calendarElement.addEventListener("touchend", handleTouchEnd);
      calendarElement.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      if (calendarElement) {
        calendarElement.removeEventListener("touchstart", handleTouchStart);
        calendarElement.removeEventListener("touchmove", handleTouchMove);
        calendarElement.removeEventListener("touchend", handleTouchEnd);
        calendarElement.removeEventListener("touchcancel", handleTouchEnd);
      }
    };
  }, [elementId]);
};
