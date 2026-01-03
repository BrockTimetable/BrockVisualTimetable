import { useContext, useState } from "react";
import ColorModeContext from "../contexts/ColorModeContext";
import { Link } from "react-router-dom";
import { useIsMobile } from "../utils/screenSizeUtils";
import {
  Moon,
  Sun,
  Menu,
  Home,
  BookOpen,
  MessageSquare,
  Github,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Separator } from "../../components/ui/separator";

const NavbarComponent = () => {
  const colorMode = useContext(ColorModeContext);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mt-2 flex h-[70px] w-full flex-col items-center bg-background px-4 text-foreground md:flex-row">
      <div className="flex w-full items-center justify-between">
        <div className={isMobile ? "text-xl font-bold" : "text-3xl font-bold"}>
          📚 brocktimetable.com
        </div>
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={colorMode.toggleColorMode}
              aria-label="Toggle color mode"
            >
              <span className="dark:hidden">
                <Moon className="h-5 w-5" />
              </span>
              <span className="hidden dark:inline-flex">
                <Sun className="h-5 w-5" />
              </span>
            </Button>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col p-0">
                <div className="border-b border-border p-6">
                  <div className="text-lg font-bold">📚 brocktimetable.com</div>
                </div>
                <nav className="flex-1 p-2">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        to="/"
                      >
                        <Home className="h-4 w-4" />
                        Generator
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                        to="/guide"
                      >
                        <BookOpen className="h-4 w-4" />
                        Guide
                      </Link>
                    </li>
                  </ul>
                </nav>
                <Separator />
                <div className="p-2">
                  <a
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                    href="https://github.com/BrockTimetable/BrockVisualTimetable/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </a>
                </div>
                <Separator />
                <div className="flex justify-center p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="GitHub"
                  >
                    <a
                      href="https://github.com/BrockTimetable/BrockVisualTimetable"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium hover:underline" to="/">
              Generator
            </Link>
            <Link className="text-sm font-medium hover:underline" to="/guide">
              Guide
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={colorMode.toggleColorMode}
              aria-label="Toggle color mode"
            >
              <span className="dark:hidden">
                <Moon className="h-5 w-5" />
              </span>
              <span className="hidden dark:inline-flex">
                <Sun className="h-5 w-5" />
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarComponent;
