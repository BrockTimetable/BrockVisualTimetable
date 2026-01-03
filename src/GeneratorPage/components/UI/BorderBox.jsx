import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";

export default function BorderBox({ title, children }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="border-box"
      className="overflow-hidden rounded-lg border border-primary sm:rounded-lg"
    >
      <AccordionItem value="border-box" className="border-none">
        <AccordionTrigger className="bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:no-underline">
          <span>{title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
