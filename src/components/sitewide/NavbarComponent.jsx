import React, { useContext, useState } from "react";
import { useTheme } from "@mui/material/styles";
import ColorModeContext from "@/lib/contexts/sitewide/ColorModeContext";
import { Link } from "react-router-dom";
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

const NavbarComponent = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    {
      label: "Generator",
      to: "/",
      icon: Home,
    },
    {
      label: "Guide",
      to: "/guide",
      icon: BookOpen,
      newTab: true,
    },
  ];

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
          return (
            <Button
              key={item.label}
              variant="ghost"
              className="justify-start"
              asChild
              onClick={() => setDrawerOpen(false)}
            >
              {item.newTab ? (
                <a href={item.to} target="_blank" rel="noopener noreferrer">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </a>
              ) : (
                <Link to={item.to}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              )}
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
              aria-label="Toggle theme"
            >
              {theme.palette.mode === "dark" ? (
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
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Button key={item.label} variant="ghost" asChild>
                {item.newTab ? (
                  <a href={item.to} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={colorMode.toggleColorMode}
              aria-label="Toggle theme"
            >
              {theme.palette.mode === "dark" ? (
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
