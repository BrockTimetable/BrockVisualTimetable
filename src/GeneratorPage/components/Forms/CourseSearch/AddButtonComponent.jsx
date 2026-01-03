import { PlusSquare } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export default function AddButtonComponent({ onAddCourse }) {
  return (
    <div>
      <Button onClick={onAddCourse}>
        <PlusSquare className="h-4 w-4" />
        ADD COURSE
      </Button>
    </div>
  );
}
