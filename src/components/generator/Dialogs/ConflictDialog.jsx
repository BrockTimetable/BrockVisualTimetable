import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/utils/screenSizeUtils";

// "COSC1P02" -> "COSC 1P02"
const formatCourseCode = (code) =>
  /^[A-Z]{4}\d/.test(code) ? `${code.slice(0, 4)} ${code.slice(4)}` : code;

// "1100-1230" -> "11:00 - 12:30"
const formatTime = (time) =>
  time
    .split("-")
    .map((part) => {
      const t = part.trim().padStart(4, "0");
      return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
    })
    .join(" - ");

const formatComponent = (component) =>
  `${formatCourseCode(component.courseCode)} ${component.type} (${component.days.join(
    " ",
  )} ${formatTime(component.time)})`;

const CARD_WIDTH = 340;
const GAP = 12;

// Bounding box that encloses every highlighted conflict event in the calendar.
const computeConflictAnchor = () => {
  const els = Array.from(
    document.querySelectorAll("#Calendar .fc-event-conflict"),
  );
  if (els.length === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  els.forEach((el) => {
    const rect = el.getBoundingClientRect();
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  });

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
};

// Brings the conflict into view, then (when bottomReserved is set, e.g. the
// mobile bottom sheet) nudges it into the visible area above the sheet so it is
// not hidden behind it. Scrolls the calendar's inner scroller first, then the
// page for any remainder, so the two never double-count.
const scrollConflictIntoFrame = (el, bottomReserved) => {
  el.scrollIntoView({ block: "center", inline: "nearest" });
  if (bottomReserved <= 0) return;

  const available = window.innerHeight - bottomReserved;
  if (available <= 0) return;

  const rect = el.getBoundingClientRect();
  const currentCenter = rect.top + rect.height / 2;
  let delta = currentCenter - available / 2;
  if (Math.abs(delta) < 4) return;

  const scroller = el.closest(".fc-scroller");
  if (scroller) {
    const before = scroller.scrollTop;
    scroller.scrollTop += delta;
    delta -= scroller.scrollTop - before;
  }
  if (Math.abs(delta) > 1) {
    window.scrollBy(0, delta);
  }
};

export default function ConflictDialog({
  open,
  onClose,
  conflictInfo,
  onRemoveCourse,
}) {
  const isMobile = useIsMobile();
  const [anchor, setAnchor] = useState(null);
  const cardRef = useRef(null);
  const [cardStyle, setCardStyle] = useState({
    left: 0,
    top: 0,
    visibility: "hidden",
  });

  const refreshAnchor = useCallback(() => {
    setAnchor(computeConflictAnchor());
  }, []);

  // On open: scroll/frame the conflict into view, freeze page scrolling, then
  // lock onto its position. The calendar may render its events a frame or two
  // later, so retry briefly until the highlighted elements appear (falling back
  // to a centered/sheet card). The anchor is recomputed on any scroll/resize so
  // the highlight always stays aligned with the conflict.
  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let rafId;
    let timeoutId;
    let scrollLocked = false;

    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const lockScroll = () => {
      if (scrollLocked) return;
      scrollLocked = true;
      // Compensate for the removed scrollbar so nothing shifts horizontally.
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPadding =
          parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
      body.style.overflow = "hidden";
    };

    const frameAndLock = () => {
      if (cancelled) return;
      const el = document.querySelector("#Calendar .fc-event-conflict");
      if (el) {
        // On mobile reserve the bottom-sheet height so the conflict frames above
        // it; on desktop the floating card is placed around the conflict later.
        const reserved =
          isMobile && cardRef.current ? cardRef.current.offsetHeight + GAP : 0;
        scrollConflictIntoFrame(el, reserved);
      }
      lockScroll();
      rafId = requestAnimationFrame(() => {
        if (!cancelled) refreshAnchor();
      });
    };

    const attempt = (remaining) => {
      if (cancelled) return;
      const els = document.querySelectorAll("#Calendar .fc-event-conflict");
      if (els.length > 0) {
        // Wait a frame so the card (sheet) is laid out and measurable.
        rafId = requestAnimationFrame(frameAndLock);
        return;
      }
      if (remaining > 0) {
        timeoutId = setTimeout(() => attempt(remaining - 1), 100);
      } else {
        lockScroll();
        setAnchor(null);
      }
    };

    attempt(10);
    window.addEventListener("resize", refreshAnchor);
    // Capture phase so scrolling of any inner container repositions the anchor.
    window.addEventListener("scroll", refreshAnchor, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", refreshAnchor);
      window.removeEventListener("scroll", refreshAnchor, true);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open, conflictInfo, isMobile, refreshAnchor]);

  // Desktop only: place the floating card beneath the conflict (or above it
  // when there is no room). On mobile the card is a fixed bottom sheet.
  useLayoutEffect(() => {
    if (!open || isMobile) return;
    const card = cardRef.current;
    if (!card) return;

    const { innerWidth: vw, innerHeight: vh } = window;
    const cardHeight = card.offsetHeight;
    const width = Math.min(CARD_WIDTH, vw - 2 * GAP);

    let left;
    let top;
    if (anchor) {
      const centerX = anchor.left + anchor.width / 2;
      left = centerX - width / 2;
      const spaceBelow = vh - anchor.bottom;
      top =
        spaceBelow >= cardHeight + GAP
          ? anchor.bottom + GAP
          : anchor.top - cardHeight - GAP;
    } else {
      // Fallback: no conflict element on screen — center the card.
      left = (vw - width) / 2;
      top = (vh - cardHeight) / 2;
    }

    left = Math.max(GAP, Math.min(left, vw - width - GAP));
    top = Math.max(GAP, Math.min(top, vh - cardHeight - GAP));

    setCardStyle({ left, top, width, visibility: "visible" });
  }, [open, isMobile, anchor, conflictInfo]);

  if (!open || !conflictInfo) return null;

  const { involvedCourses = [], pairs = [] } = conflictInfo;

  const cardBody = (
    <>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          Unavoidable Schedule Conflict
        </div>
        <p className="text-sm text-muted-foreground">
          These class components can&apos;t fit together without overlapping.
          Remove/unpin one of them, or keep this timetable and ignore the
          overlap.
        </p>
      </div>

      <div className="rounded-md border border-red-200 bg-red-50 p-2.5 dark:border-red-900/50 dark:bg-red-950/30">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {pairs.map((pair, index) => (
            <li key={index} className="leading-snug">
              <div className="font-medium text-foreground">
                {formatComponent(pair.a)}
              </div>
              <div className="text-xs uppercase tracking-wide text-red-600 dark:text-red-400">
                overlaps
              </div>
              <div className="font-medium text-foreground">
                {formatComponent(pair.b)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1.5">
        <div className="text-sm font-medium text-foreground">
          Remove a course
        </div>
        <div className="flex flex-wrap gap-2">
          {involvedCourses.map((course) => (
            <Button
              key={course.courseCode}
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onRemoveCourse(course.courseCode)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {formatCourseCode(course.courseCode)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={onClose}>
          Pin &amp; Ignore
        </Button>
      </div>
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Spotlight: darkens everything except the conflict cut-out. */}
      {anchor ? (
        <div
          className="pointer-events-none fixed rounded-md"
          style={{
            left: anchor.left - 4,
            top: anchor.top - 4,
            width: anchor.width + 8,
            height: anchor.height + 8,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
            border: "2px solid #dc2626",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70" />
      )}

      {/* Blocks interaction with the page behind. Clicking the darkened area
          intentionally does nothing so conflicts can't be pinned by accident —
          the user must use the buttons in the card. */}
      <div className="fixed inset-0" aria-hidden="true" />

      {isMobile ? (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-label="Schedule conflict"
          className="fixed inset-x-0 bottom-0 z-[1001] max-h-[60vh] space-y-3 overflow-y-auto rounded-t-2xl border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl"
        >
          <div className="mx-auto -mt-1 mb-1 h-1 w-10 rounded-full bg-muted-foreground/30" />
          {cardBody}
        </div>
      ) : (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-label="Schedule conflict"
          className="fixed z-[1001] space-y-3 rounded-lg border bg-background p-4 shadow-xl"
          style={cardStyle}
        >
          {cardBody}
        </div>
      )}
    </div>,
    document.body,
  );
}

ConflictDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemoveCourse: PropTypes.func.isRequired,
  conflictInfo: PropTypes.shape({
    involvedCourses: PropTypes.arrayOf(
      PropTypes.shape({
        courseCode: PropTypes.string.isRequired,
        courseName: PropTypes.string,
      }),
    ),
    pairs: PropTypes.arrayOf(
      PropTypes.shape({
        a: PropTypes.object.isRequired,
        b: PropTypes.object.isRequired,
      }),
    ),
    pinTargets: PropTypes.arrayOf(PropTypes.string),
  }),
};
