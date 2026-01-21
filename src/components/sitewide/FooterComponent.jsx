import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FooterComponent() {
  return (
    <footer className="w-full bg-transparent">
      <div className="flex items-center justify-between px-4 py-4 text-sm text-muted-foreground">
        <p>brocktimetable.com © 2026</p>
        <Button asChild variant="ghost" size="icon">
          <a
            href="https://github.com/BrockTimetable/BrockVisualTimetable"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </footer>
  );
}
