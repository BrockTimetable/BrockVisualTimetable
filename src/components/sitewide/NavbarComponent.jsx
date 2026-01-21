import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ColorModeContext from "@/lib/contexts/sitewide/ColorModeContext";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/lib/utils/screenSizeUtils";
import {
  BookOpen,
  Github,
  Home,
  Menu,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NavbarComponent = () => {
  const colorMode = useContext(ColorModeContext);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const desktopNavRef = useRef(null);
  const desktopItemRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState(null);

  const navItems = [
    {
      label: "Generator",
      to: "/",
      icon: Home,
      end: true,
    },
    {
      label: "Guide",
      to: "/guide",
      icon: BookOpen,
      newTab: true,
      end: true,
    },
  ];

  const isActiveRoute = (item) => {
    if (item.end) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  const activeIndex = navItems.findIndex((item) => isActiveRoute(item));

  const updateIndicatorFromIndex = (index) => {
    if (index < 0) {
      setIndicatorStyle(null);
      return;
    }
    const navNode = desktopNavRef.current;
    const itemNode = desktopItemRefs.current[index];
    if (!navNode || !itemNode) {
      return;
    }
    const navRect = navNode.getBoundingClientRect();
    const itemRect = itemNode.getBoundingClientRect();
    setIndicatorStyle({
      left: itemRect.left - navRect.left,
      top: itemRect.top - navRect.top,
      width: itemRect.width,
      height: itemRect.height,
    });
  };

  const resetIndicator = () => {
    updateIndicatorFromIndex(activeIndex);
  };

  useLayoutEffect(() => {
    if (isMobile) {
      return;
    }
    resetIndicator();
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (isMobile) {
      return undefined;
    }
    const handleResize = () => resetIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, location.pathname]);

  const drawerContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-6">
        <SheetTitle className="text-base font-semibold">
          📚 brocktimetable.com
        </SheetTitle>
      </div>
      <Separator />
      <nav className="flex flex-col gap-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item);
          return (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "justify-start",
                isActive && "bg-accent text-accent-foreground",
              )}
              asChild
              onClick={() => setDrawerOpen(false)}
            >
              <Link
                to={item.to}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <Separator />
      <nav className="flex flex-col gap-1 px-2 py-4">
        <Button
          variant="ghost"
          className="justify-start"
          asChild
          onClick={() => setDrawerOpen(false)}
        >
          <a
            href="https://github.com/BrockTimetable/BrockVisualTimetable/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </a>
        </Button>
      </nav>
      <div className="mt-auto flex justify-center p-4">
        <Button variant="ghost" size="icon" asChild aria-label="GitHub">
          <a
            href="https://github.com/BrockTimetable/BrockVisualTimetable"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mt-2 flex h-[70px] w-full items-center bg-transparent px-4">
      <div className="flex w-full items-center justify-between">
        <div className="text-lg font-semibold sm:text-2xl">
          📚 brocktimetable.com
        </div>
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={colorMode.toggleColorMode}
              onMouseEnter={resetIndicator}
              onFocus={resetIndicator}
              aria-label="Toggle theme"
            >
              {colorMode.mode === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                {drawerContent}
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div
            ref={desktopNavRef}
            className="relative flex items-center gap-2"
            onMouseLeave={resetIndicator}
            onBlur={() => {
              requestAnimationFrame(() => {
                if (!desktopNavRef.current?.contains(document.activeElement)) {
                  resetIndicator();
                }
              });
            }}
          >
            {indicatorStyle ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute z-0 rounded-md bg-accent transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none"
                style={{
                  width: `${indicatorStyle.width}px`,
                  height: `${indicatorStyle.height}px`,
                  transform: `translate(${indicatorStyle.left}px, ${indicatorStyle.top}px)`,
                }}
              />
            ) : null}
            {navItems.map((item, index) => {
              const isActive = isActiveRoute(item);
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "relative z-10 hover:bg-transparent",
                    isActive && "text-accent-foreground",
                  )}
                  asChild
                >
                  <Link
                    to={item.to}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    aria-current={isActive ? "page" : undefined}
                    ref={(node) => {
                      desktopItemRefs.current[index] = node;
                    }}
                    onMouseEnter={() => updateIndicatorFromIndex(index)}
                    onFocus={() => updateIndicatorFromIndex(index)}
                  >
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              onClick={colorMode.toggleColorMode}
              onMouseEnter={resetIndicator}
              onFocus={resetIndicator}
              aria-label="Toggle theme"
            >
              {colorMode.mode === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarComponent;
