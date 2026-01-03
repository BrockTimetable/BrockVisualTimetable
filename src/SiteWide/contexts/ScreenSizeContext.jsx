import {
  createContext,
  useContext,
  useSyncExternalStore,
  useRef,
  useCallback,
} from "react";

const ScreenSizeContext = createContext({
  isMobile: false,
  isBelowMedium: false,
});

// Create a store that manages screen size state efficiently
class ScreenSizeStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      isMobile:
        typeof window !== "undefined" ? window.innerWidth <= 600 : false,
      isBelowMedium:
        typeof window !== "undefined" ? window.innerWidth <= 900 : false,
    };
    this.lastWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    this.resizeFrameId = null;
    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    // Use matchMedia for efficient detection
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const mediumQuery = window.matchMedia("(max-width: 900px)");

    // Set initial values from matchMedia
    this.state.isMobile = mobileQuery.matches;
    this.state.isBelowMedium = mediumQuery.matches;

    // Listen to media query changes
    const updateMobile = (e) => {
      if (this.state.isMobile !== e.matches) {
        this.state.isMobile = e.matches;
        this.notify();
      }
    };

    const updateMedium = (e) => {
      if (this.state.isBelowMedium !== e.matches) {
        this.state.isBelowMedium = e.matches;
        this.notify();
      }
    };

    mobileQuery.addEventListener("change", updateMobile);
    mediumQuery.addEventListener("change", updateMedium);

    // Optimized resize listener - only updates when breakpoint crosses
    const handleResize = () => {
      if (this.resizeFrameId !== null) {
        cancelAnimationFrame(this.resizeFrameId);
      }

      this.resizeFrameId = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const lastWidth = this.lastWidth;

        // Only check if we've crossed a breakpoint threshold
        const wasMobile = lastWidth <= 600;
        const wasBelowMedium = lastWidth <= 900;
        const isNowMobile = width <= 600;
        const isNowBelowMedium = width <= 900;

        // Only update state if breakpoint actually changed
        let changed = false;
        if (wasMobile !== isNowMobile && this.state.isMobile !== isNowMobile) {
          this.state.isMobile = isNowMobile;
          changed = true;
        }
        if (
          wasBelowMedium !== isNowBelowMedium &&
          this.state.isBelowMedium !== isNowBelowMedium
        ) {
          this.state.isBelowMedium = isNowBelowMedium;
          changed = true;
        }

        if (changed) {
          this.notify();
        }

        this.lastWidth = width;
        this.resizeFrameId = null;
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Store cleanup function
    this.cleanup = () => {
      mobileQuery.removeEventListener("change", updateMobile);
      mediumQuery.removeEventListener("change", updateMedium);
      window.removeEventListener("resize", handleResize);
      if (this.resizeFrameId !== null) {
        cancelAnimationFrame(this.resizeFrameId);
      }
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.state;
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }
    this.listeners.clear();
  }
}

// Create singleton store instance
let storeInstance = null;

const getStore = () => {
  if (!storeInstance) {
    storeInstance = new ScreenSizeStore();
  }
  return storeInstance;
};

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error("useScreenSize must be used within ScreenSizeProvider");
  }
  return context;
};

export const ScreenSizeProvider = ({ children }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = getStore();
  }

  const subscribe = useCallback(
    (callback) => storeRef.current.subscribe(callback),
    [],
  );

  const getSnapshot = useCallback(() => storeRef.current.getSnapshot(), []);

  // Use useSyncExternalStore for optimal performance - this is React 18's recommended way
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <ScreenSizeContext.Provider value={state}>
      {children}
    </ScreenSizeContext.Provider>
  );
};
