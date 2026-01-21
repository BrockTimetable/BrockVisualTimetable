import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function BorderBox({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [maxHeight, setMaxHeight] = useState("none");
  const contentRef = useRef(null);

  const measureContentHeight = () =>
    contentRef.current ? contentRef.current.scrollHeight : 0;
  const transitionDuration = Math.min(
    320,
    Math.max(140, Math.round(120 + contentHeight / 4)),
  );
  const opacityDuration = Math.max(120, Math.round(transitionDuration * 0.7));
  const transition = isAnimating
    ? `max-height ${transitionDuration}ms ease, opacity ${opacityDuration}ms ease`
    : "none";

  const handleToggle = () => {
    const measuredHeight = measureContentHeight();
    setContentHeight(measuredHeight);
    setIsAnimating(true);

    if (isExpanded) {
      setMaxHeight(`${measuredHeight}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight("0px");
        });
      });
    } else {
      setMaxHeight(`${measuredHeight}px`);
    }

    setIsExpanded((prev) => !prev);
  };

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== "max-height") return;
    setIsAnimating(false);
    if (isExpanded) {
      setMaxHeight("none");
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-none border border-primary/70 sm:rounded-lg">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between bg-primary px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <span>{title}</span>
        <span
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <div
        className="overflow-hidden px-4 will-change-[max-height,opacity]"
        style={{
          maxHeight,
          opacity: isExpanded ? 1 : 0,
          transition,
        }}
        onTransitionEnd={handleTransitionEnd}
        aria-hidden={!isExpanded}
      >
        <div ref={contentRef} className="py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
