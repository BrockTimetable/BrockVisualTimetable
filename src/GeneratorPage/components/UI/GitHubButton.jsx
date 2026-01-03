import { Github } from "lucide-react";
import { Button } from "../../../components/ui/button";

const GitHubButton = () => {
  return (
    <div className="flex items-center justify-center">
      <Button asChild className="bg-black text-white hover:bg-black">
        <a
          href="https://github.com/BrockTimetable/BrockVisualTimetable"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
      </Button>
    </div>
  );
};

export default GitHubButton;
